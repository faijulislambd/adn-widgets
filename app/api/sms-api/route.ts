import { getBrowser } from "@/lib/browser";

export const maxDuration = 60;

export async function GET() {
  const email = process.env.ADNSMS_EMAIL;
  const password = process.env.ADNSMS_PASSWORD;
  const url = process.env.ADNSMS_URL || "https://portal.adnsms.com/system/dashboard";

  if (!email || !password) {
    return Response.json(
      { error: "ADNSMS_EMAIL and ADNSMS_PASSWORD environment variables are required" },
      { status: 500 }
    );
  }

  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    await page.goto(url);

    await page.waitForSelector("#email");
    await page.type("#email", email);
    await page.waitForSelector("#password");
    await page.type("#password", password);
    await page.waitForSelector(".btn-login");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click(".btn-login"),
    ]);

    const smsData = await page.evaluate(() => ({
      success: document.querySelector("#success_total_sms")?.textContent?.trim(),
      failed: document.querySelector("#failed_total_sms")?.textContent?.trim(),
      pending: document.querySelector("#pending_total_sms")?.textContent?.trim(),
      topTreeClients: Array.from(document.querySelectorAll("#topClientTbody tr"))
        .slice(0, 3)
        .map((row) => {
          const cells = row.querySelectorAll("td");
          return {
            clientName: cells[0]?.textContent?.trim() || "",
            totalSMS: cells[1]?.textContent?.trim() || "",
          };
        }),
    }));

    return Response.json({ success: true, smsData });
  } catch (error) {
    console.error("Error occurred:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  } finally {
    await page?.close();
  }
}
