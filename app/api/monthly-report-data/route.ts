import { getBrowser } from "@/lib/browser";
import {
  readMonthlyCache,
  writeMonthlyCache,
  isCacheFresh,
} from "@/lib/monthly-data-cache";

export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";

  // Serve from cache if fresh and not forced
  if (!force) {
    const cache = readMonthlyCache();
    if (cache && isCacheFresh(cache)) {
      return Response.json({
        success: true,
        monthlySmsData: cache.data,
        fromCache: true,
        cachedAt: cache.cachedAt,
      });
    }
  }

  const email = process.env.ADNSMS_EMAIL;
  const password = process.env.ADNSMS_PASSWORD;
  const url =
    process.env.ADNSMS_URL || "https://portal.adnsms.com/system/dashboard";

  if (!email || !password) {
    return Response.json(
      {
        error:
          "ADNSMS_EMAIL and ADNSMS_PASSWORD environment variables are required",
      },
      { status: 500 },
    );
  }

  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

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

    await page.select("#period", "this_month");
    await page.click("#searchSmsConsumption");

    // After search the portal may do a full page reload, which destroys any
    // persistent waitForFunction listener. A polling loop with page.evaluate
    // is more robust — each call is a fresh context that survives navigation.
    // Poll every 5 s for up to 20 minutes (240 attempts).
    let monthlySmsData = null;
    for (let i = 0; i < 240; i++) {
      try {
        monthlySmsData = await page.evaluate(() => {
          const success = document
            .querySelector("#success_total_sms")
            ?.textContent?.trim();
          const failed = document
            .querySelector("#failed_total_sms")
            ?.textContent?.trim();
          const pending = document
            .querySelector("#pending_total_sms")
            ?.textContent?.trim();

          // Ignore placeholder values — wait for real numeric data
          if (
            !success ||
            !failed ||
            !pending ||
            success === "-" ||
            failed === "-" ||
            pending === "-"
          )
            return null;

          return {
            success,
            failed,
            pending,
            topThreeClients: Array.from(
              document.querySelectorAll("#topClientTbody tr"),
            )
              .slice(0, 3)
              .map((row) => {
                const cells = row.querySelectorAll("td");
                return {
                  clientName: cells[0]?.textContent?.trim() || "",
                  totalSMS: cells[1]?.textContent?.trim() || "",
                };
              }),
          };
        });
      } catch {
        // Page context destroyed (navigation in progress) — wait and retry
      }

      if (monthlySmsData) break;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (!monthlySmsData) {
      throw new Error("SMS data failed to load.");
    }

    writeMonthlyCache(monthlySmsData);

    return Response.json({
      success: true,
      monthlySmsData,
      fromCache: false,
      cachedAt: Date.now(),
    });
  } catch (error) {
    console.error("Monthly report error:", error);

    // Return stale cache if available rather than failing completely
    const staleCache = readMonthlyCache();
    if (staleCache) {
      return Response.json({
        success: true,
        monthlySmsData: staleCache.data,
        fromCache: true,
        stale: true,
        cachedAt: staleCache.cachedAt,
        warning: "Live data unavailable — showing last cached result.",
      });
    }

    return Response.json({ error: String(error) }, { status: 500 });
  } finally {
    await page?.close();
  }
}
