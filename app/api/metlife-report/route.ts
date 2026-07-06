import { getBrowser } from "@/lib/browser";
import { readReportCache, writeReportCache, REDIS_KEYS } from "@/lib/redis";
import moment from "moment";

export const maxDuration = 60;

interface MetlifeData {
  maskConsumption: number;
  nonMaskConsumption: number;
  internationalConsumption: number;
}

async function scrapeMetlifeData(): Promise<MetlifeData> {
  const email = process.env.METLIFE_EMAIL;
  const password = process.env.METLIFE_PASSWORD;
  const url =
    process.env.METLIFE_URL || "https://master.adnsms.com/consumption/report";

  if (!email || !password) {
    throw new Error(
      "METLIFE_EMAIL and METLIFE_PASSWORD environment variables are required",
    );
  }

  let page;
  let step = "init";
  try {
    step = "getBrowser";
    const browser = await getBrowser();
    page = await browser.newPage();

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

    const startDate = moment().format("YYYY-MM-DD");
    const endDate = moment().format("YYYY-MM-DD");

    await page.$eval(
      "#start_date",
      (el, value) => {
        (el as HTMLInputElement).value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      },
      startDate,
    );

    await page.$eval(
      "#end_date",
      (el, value) => {
        (el as HTMLInputElement).value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      },
      endDate,
    );

    await page.waitForSelector("#searchCampaign");
    await page.click("#searchCampaign");

    await page.waitForFunction(
      () => {
        const loader = document.querySelector(".loaderbox");
        return loader?.classList.contains("hide");
      },
      {
        timeout: 60000,
      },
    );

    step = "parse";
    return await page.evaluate(() => {
      const parseCount = (selector: string) => {
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
  } catch (error) {
    throw new Error(`[${step}] ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await page?.close();
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";

  try {
    if (!force) {
      const cache = await readReportCache<MetlifeData>(REDIS_KEYS.metlife);
      if (cache) {
        return Response.json({
          success: true,
          metlifeData: cache.data,
          fromCache: true,
          cachedAt: cache.scrapedAt,
        });
      }
      // No cached value yet (e.g. cron hasn't run) — fall through to a live scrape.
    }

    const metlifeData = await scrapeMetlifeData();
    await writeReportCache(REDIS_KEYS.metlife, metlifeData, "manual");

    return Response.json({
      success: true,
      metlifeData,
      fromCache: false,
      cachedAt: Date.now(),
    });
  } catch (error) {
    console.error("Metlife report error:", error);

    const staleCache = await readReportCache<MetlifeData>(REDIS_KEYS.metlife);
    if (staleCache) {
      return Response.json({
        success: true,
        metlifeData: staleCache.data,
        fromCache: true,
        stale: true,
        cachedAt: staleCache.scrapedAt,
        warning: "Live data unavailable — showing last cached result.",
      });
    }

    return Response.json({ error: String(error) }, { status: 500 });
  }
}
