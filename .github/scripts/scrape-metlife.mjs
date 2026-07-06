import puppeteer from "puppeteer";

const email = process.env.METLIFE_EMAIL;
const password = process.env.METLIFE_PASSWORD;
const url = process.env.METLIFE_URL;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!email || !password || !url || !redisUrl || !redisToken) {
  console.error("Missing one or more required environment variables.");
  process.exit(1);
}

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

let step = "init";
try {
  const page = await browser.newPage();

  step = "goto";
  await page.goto(url, { waitUntil: "networkidle2" });

  step = "login-check";
  const emailField = await page.$("[type='email']");
  if (emailField) {
    step = "login";
    await page.type("[type='email']", email);
    await page.waitForSelector("[type='password']");
    await page.type("[type='password']", password);
    await page.waitForSelector(".btn");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click(".btn"),
    ]);
  }

  step = "select-period";
  await page.waitForSelector("#period");
  await page.select("#period", "custom");

  step = "wait-dates";
  await page.waitForSelector("#start_date");
  await page.waitForSelector("#end_date");

  const today = new Date().toISOString().slice(0, 10);

  await page.$eval(
    "#start_date",
    (el, value) => {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    },
    today,
  );

  await page.$eval(
    "#end_date",
    (el, value) => {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    },
    today,
  );

  step = "search";
  await page.waitForSelector("#searchCampaign");
  await page.click("#searchCampaign");

  await page.waitForFunction(
    () => {
      const loader = document.querySelector(".loaderbox");
      return loader?.classList.contains("hide");
    },
    { timeout: 60000 },
  );

  step = "parse";
  const metlifeData = await page.evaluate(() => {
    const parseCount = (selector) => {
      const text =
        document.querySelector(selector)?.textContent?.trim() ?? "0";
      return parseInt(text.replace(/[^0-9]/g, ""), 10) || 0;
    };
    return {
      maskConsumption: parseCount("#maskconid"),
      nonMaskConsumption: parseCount("#non-maskconid"),
      internationalConsumption: parseCount("#int-conid"),
    };
  });

  const entry = { data: metlifeData, scrapedAt: Date.now(), source: "cron" };

  step = "write-cache";
  const res = await fetch(`${redisUrl}/set/metlife:latest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${redisToken}` },
    body: JSON.stringify(entry),
  });

  if (!res.ok) {
    throw new Error(`Upstash write failed: HTTP ${res.status}`);
  }

  // Intentionally never log consumption figures — this repo is public and
  // Actions logs are visible to anyone.
  console.log("METLIFE scrape succeeded — cached.");
} catch (err) {
  console.error(`METLIFE scrape failed at step [${step}]:`, err.message);
  process.exit(1);
} finally {
  await browser.close();
}
