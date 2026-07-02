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

    // Wait until the dashboard AJAX populates the success count (non-empty, non-zero)
    await page.waitForFunction(
      () => {
        const el = document.querySelector("#success_total_sms");
        const text = el?.textContent?.trim();
        return text !== undefined && text !== "" && text !== "0";
      },
      { timeout: 30000 },
    );

    const smsData = await page.evaluate(() => {
      const parseCount = (selector: string) => {
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

    return Response.json({ success: true, smsData });
  } catch (error) {
    console.error("Error occurred:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  } finally {
    await page?.close();
  }
}
