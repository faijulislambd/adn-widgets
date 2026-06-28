import { getBrowser } from "@/lib/browser";

export const maxDuration = 60;

export async function GET() {
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

    // Login form may not appear if the browser session is still active
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
    // Select period
    await page.select("#period", "this_month");

    // Click search
    await page.click("#searchSmsConsumption");

    // Wait until loader disappears (যদি loader দেখায়)
    try {
      await page.waitForFunction(
        () => {
          const loader = document.querySelector(
            ".sms-consumption-loader",
          ) as HTMLElement | null;

          // যদি loader না থাকে বা hide হয়ে যায় তাহলে continue
          return !loader || getComputedStyle(loader).display === "none";
        },
        { timeout: 60000 },
      );
    } catch {
      // Loader detect না হলেও নিচের polling চলবে
    }

    // Data আসা পর্যন্ত poll করি
    let monthlySmsData = null;

    for (let i = 0; i < 60; i++) {
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

        if (!success || !failed || !pending) {
          return null;
        }

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

      if (monthlySmsData) break;

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (!monthlySmsData) {
      throw new Error("SMS data failed to load.");
    }

    return Response.json({
      success: true,
      monthlySmsData,
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  } finally {
    await page?.close();
  }
}
