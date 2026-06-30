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
  let step = "init";
  try {
    step = "getBrowser";
    const browser = await getBrowser();
    page = await browser.newPage();

    step = "goto";
    await page.goto(url, { waitUntil: "networkidle2" });

    step = "login-check";
    const emailField = await page.$("[type='email']");
    console.log("Email field found:", !!emailField);
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

    const metlifeData = await page.evaluate(() => {
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

    return Response.json({ success: true, metlifeData });
  } catch (error) {
    console.error(`Error at step [${step}]:`, error);
    return Response.json({ error: String(error), step }, { status: 500 });
  } finally {
    await page?.close();
  }
}
