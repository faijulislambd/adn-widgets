import puppeteer from "puppeteer";

const email = process.env.ADNSMS_EMAIL;
const password = process.env.ADNSMS_PASSWORD;
const loginUrl = process.env.ADNSMS_URL;
const telcoUrl = process.env.ADNSMS_TELCO_SMS_URL;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const startDate = process.env.START_DATE;
const endDate = process.env.END_DATE;

const STATUS_KEY = "telco-sms:status";
const DATA_KEY = "telco-sms:data";

// Table can take 10-20 minutes to populate for a large date range. Poll
// every 10s, and only consider it "loaded" once the row count has stayed
// unchanged across two consecutive checks — guards against reading a
// partially-rendered table mid-load.
const POLL_INTERVAL_MS = 10_000;
const MAX_WAIT_MS = 40 * 60 * 1000;

if (
  !email ||
  !password ||
  !loginUrl ||
  !telcoUrl ||
  !redisUrl ||
  !redisToken ||
  !startDate ||
  !endDate
) {
  console.error("Missing one or more required environment variables/inputs.");
  process.exit(1);
}

const redisHeaders = { Authorization: `Bearer ${redisToken}` };

async function setRedis(key, data) {
  const entry = { data, scrapedAt: Date.now(), source: "manual" };
  const res = await fetch(`${redisUrl}/set/${key}`, {
    method: "POST",
    headers: redisHeaders,
    body: JSON.stringify(entry),
  });
  if (!res.ok) {
    throw new Error(`Upstash write failed for "${key}": HTTP ${res.status}`);
  }
}

// The report page appears to trigger a full reload on some interactions
// (not just the final submit), which races any immediate follow-up action
// against the navigation and throws "Execution context was destroyed."
// Wrapping a step in this retries the whole thing — including re-finding
// the element — after a short pause, rather than failing outright.
async function withRetry(fn, attempts = 3, delayMs = 2000) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

await setRedis(STATUS_KEY, {
  status: "running",
  startDate,
  endDate,
  startedAt: Date.now(),
});

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

let step = "init";

try {
  const page = await browser.newPage();

  step = "goto-login";
  await page.goto(loginUrl, { waitUntil: "networkidle2" });

  step = "login-check";
  const emailField = await page.$("#email");
  if (emailField) {
    step = "login";
    await page.type("#email", email);
    await page.waitForSelector("#password");
    await page.type("#password", password);
    await page.waitForSelector(".btn-login");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click(".btn-login"),
    ]);
  }

  step = "goto-telco";
  await page.goto(telcoUrl, { waitUntil: "networkidle2" });

  step = "set-start-date";
  await withRetry(() =>
    page.waitForSelector("#formDate").then(() =>
      page.$eval(
        "#formDate",
        (el, value) => {
          el.value = value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        },
        startDate,
      ),
    ),
  );

  step = "set-end-date";
  await withRetry(() =>
    page.waitForSelector("#toDate").then(() =>
      page.$eval(
        "#toDate",
        (el, value) => {
          el.value = value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        },
        endDate,
      ),
    ),
  );

  step = "submit-search";
  await withRetry(() =>
    page
      .waitForSelector("[type='submit']")
      .then(() => page.click("[type='submit']")),
  );

  step = "wait-for-table";
  const started = Date.now();
  let previousCount = -1;
  let stableRounds = 0;

  while (Date.now() - started < MAX_WAIT_MS) {
    let rowCount = null;
    try {
      rowCount = await page.$$eval(
        "#smslogTable tbody tr",
        (rows) => rows.length,
      );
    } catch {
      // Page context destroyed (navigation in progress) — wait and retry.
    }

    if (rowCount !== null && rowCount > 0 && rowCount === previousCount) {
      stableRounds++;
      if (stableRounds >= 2) break;
    } else {
      stableRounds = 0;
    }
    if (rowCount !== null) previousCount = rowCount;

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  if (previousCount <= 0) {
    throw new Error("Table never populated with data within the time limit.");
  }

  step = "extract-rows";
  const rows = await withRetry(() =>
    page.$$eval("#smslogTable", (table) => {
      const headerCells = Array.from(table.querySelectorAll("thead th")).map(
        (th) => th.textContent?.trim() || "",
      );
      const bodyRows = Array.from(table.querySelectorAll("tbody tr"));

      return bodyRows.map((tr) => {
        const cells = Array.from(tr.querySelectorAll("td"));
        const row = {};
        cells.forEach((td, i) => {
          const key = headerCells[i] || `column_${i}`;
          row[key] = td.textContent?.trim() || "";
        });
        return row;
      });
    }),
  );

  step = "write-cache";
  await setRedis(DATA_KEY, { rows, startDate, endDate });

  await setRedis(STATUS_KEY, {
    status: "done",
    startDate,
    endDate,
    finishedAt: Date.now(),
    rowCount: rows.length,
  });

  // Intentionally never log row contents — this repo is public and Actions
  // logs are visible to anyone. Only a non-identifying count.
  console.log(`Telco SMS scrape succeeded — ${rows.length} rows cached.`);
} catch (err) {
  const message = `[${step}] ${err.message}`;
  console.error("Telco SMS scrape failed:", message);
  try {
    await setRedis(STATUS_KEY, {
      status: "failed",
      startDate,
      endDate,
      finishedAt: Date.now(),
      error: message,
    });
  } catch {
    // Redis write itself failed — nothing more we can do here.
  }
  process.exit(1);
} finally {
  await browser.close();
}
