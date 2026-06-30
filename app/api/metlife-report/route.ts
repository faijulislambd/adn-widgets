import { getBrowser } from "@/lib/browser";
import moment from "moment";

export const maxDuration = 60;

export async function GET() {
  const email = process.env.METLIFE_EMAIL;
  const password = process.env.METLIFE_PASSWORD;
  const url =
    process.env.METLIFE_URL || "https://master.adnsms.com/consumption/report";

  if (!email || !password) {
    return Response.json(
      {
        error:
          "METLIFE_EMAIL and METLIFE_PASSWORD environment variables are required",
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
    const emailField = await page.$("[type='email']");
    console.log("Email field found:", !!emailField);
    if (emailField) {
      await page.type("[type='email']", email);
      await page.waitForSelector("[type='password']");
      await page.type("[type='password']", password);
      await page.waitForSelector(".btn");
      await page.click(".btn");

      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2" }),
      ]);
    }

    await page.select("#period", "custom");
    await page.waitForSelector("#date-range");
    await page.type("#start_date", moment().format("YYYY-MM-DD"));
    await page.type("#end_date", moment().format("YYYY-MM-DD"));
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

    const metlifeData = await page.evaluate(() => ({
      maskConsumption: document
        .querySelector("#maskconid")
        ?.textContent?.trim(),
      nonMaskConsumption: document
        .querySelector("#non-maskconid")
        ?.textContent?.trim(),
      internationalConsumption: document
        .querySelector("#int-conid")
        ?.textContent?.trim(),
    }));

    return Response.json({ success: true, metlifeData });
  } catch (error) {
    console.error("Error occurred:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  } finally {
    await page?.close();
  }
}
