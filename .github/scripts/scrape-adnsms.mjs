import puppeteer from "puppeteer";

const email = process.env.ADNSMS_EMAIL;
const password = process.env.ADNSMS_PASSWORD;
const url = process.env.ADNSMS_URL;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const REDIS_KEY = "adnsms:daily:latest";
const SKIP_IF_FRESHER_THAN_MS = 5 * 60 * 1000;

if (!email || !password || !url || !redisUrl || !redisToken) {
  console.error("Missing one or more required environment variables.");
  process.exit(1);
}

const redisHeaders = { Authorization: `Bearer ${redisToken}` };

async function getCachedScrapedAt() {
  const res = await fetch(`${redisUrl}/get/${REDIS_KEY}`, {
    headers: redisHeaders,
  });
  if (!res.ok) return null;
  const { result } = await res.json();
  if (!result) return null;
  try {
    return JSON.parse(result).scrapedAt ?? null;
  } catch {
    return null;
  }
}

const lastScrapedAt = await getCachedScrapedAt();
if (lastScrapedAt && Date.now() - lastScrapedAt < SKIP_IF_FRESHER_THAN_MS) {
  const ageSec = Math.round((Date.now() - lastScrapedAt) / 1000);
  console.log(
    `Skipping — cached data is only ${ageSec}s old (a manual refresh or a recent run already covered this).`,
  );
  process.exit(0);
}

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

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

  await page.waitForFunction(
    () => {
      const el = document.querySelector("#success_total_sms");
      const text = el?.textContent?.trim();
      return text !== undefined && text !== "" && text !== "0";
    },
    { timeout: 30000 },
  );

  const smsData = await page.evaluate(() => {
    const parseCount = (selector) => {
      const text =
        document.querySelector(selector)?.textContent?.trim() ?? "0";
      const match = text.match(/[\d,]+/);
      return match ? parseInt(match[0].replace(/,/g, ""), 10) || 0 : 0;
    };
    return {
      success: parseCount("#success_total_sms"),
      failed: parseCount("#failed_total_sms"),
      pending: parseCount("#pending_total_sms"),
      topClients: Array.from(
        document.querySelectorAll("#topClientTbody tr"),
      ).map((row) => {
        const cells = row.querySelectorAll("td");
        const smsText = cells[1]?.textContent?.trim() ?? "0";
        return {
          clientName: cells[0]?.textContent?.trim() || "",
          totalSMS: parseInt(smsText.replace(/[^0-9]/g, ""), 10) || 0,
        };
      }),
      maskSuccess: parseCount("#mask_success"),
      maskFailed: parseCount("#mask_failed"),
      maskPending: parseCount("#mask_pending"),
      nonmaskSuccess: parseCount("#nonmask_success"),
      nonmaskFailed: parseCount("#nonmask_failed"),
      nonmaskPending: parseCount("#nonmask_pending"),
    };
  });

  const entry = { data: smsData, scrapedAt: Date.now(), source: "cron" };

  const res = await fetch(`${redisUrl}/set/${REDIS_KEY}`, {
    method: "POST",
    headers: redisHeaders,
    body: JSON.stringify(entry),
  });

  if (!res.ok) {
    throw new Error(`Upstash write failed: HTTP ${res.status}`);
  }

  // Intentionally never log client names or totals — this repo is public and
  // Actions logs are visible to anyone. Only a non-identifying count.
  console.log(
    `ADNSMS scrape succeeded — ${smsData.topClients.length} client rows cached.`,
  );
} catch (err) {
  console.error("ADNSMS scrape failed:", err.message);
  process.exit(1);
} finally {
  await browser.close();
}
