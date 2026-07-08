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

try {
  const page = await browser.newPage();

  await page.goto(loginUrl, { waitUntil: "networkidle2" });

  const emailField = await page.$("#email");
  if (emailField) {
    await page.type("#email", email);
    await page.waitForSelector("#password");
    await page.type("#password", password);
    await page.waitForSelector(".btn-login");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click(".btn-login"),
    ]);
  }

  await page.goto(telcoUrl, { waitUntil: "networkidle2" });

  await page.waitForSelector("#formDate");
  await page.waitForSelector("#toDate");

  await page.$eval(
    "#formDate",
    (el, value) => {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    },
    startDate,
  );

  await page.$eval(
    "#toDate",
    (el, value) => {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    },
    endDate,
  );

  await page.waitForSelector("[type='submit']");

  // Submitting almost certainly triggers a full page reload rather than an
  // AJAX update — clicking and immediately evaluating page content races
  // the navigation and throws "Execution context was destroyed." Each
  // poll's $$eval is wrapped so that race (or any mid-navigation moment)
  // is treated as "not ready yet" and retried, not a fatal error.
  await page.click("[type='submit']");

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

  let rows;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      rows = await page.$$eval("#smslogTable", (table) => {
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
      });
      break;
    } catch {
      // Same context-destroyed race — brief pause and try again.
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  if (!rows) {
    throw new Error("Failed to read table contents after retries.");
  }

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
  console.error("Telco SMS scrape failed:", err.message);
  try {
    await setRedis(STATUS_KEY, {
      status: "failed",
      startDate,
      endDate,
      finishedAt: Date.now(),
      error: err.message,
    });
  } catch {
    // Redis write itself failed — nothing more we can do here.
  }
  process.exit(1);
} finally {
  await browser.close();
}
