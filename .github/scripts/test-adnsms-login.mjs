import puppeteer from "puppeteer";

const email = process.env.ADNSMS_EMAIL;
const password = process.env.ADNSMS_PASSWORD;
const url = process.env.ADNSMS_URL;

if (!email || !password || !url) {
  console.error("Missing ADNSMS_EMAIL, ADNSMS_PASSWORD, or ADNSMS_URL");
  process.exit(1);
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

  const stillOnLogin = await page.$("#email");
  if (stillOnLogin) {
    console.error(
      "Login failed — still on login page after submit. Check ADNSMS_EMAIL/ADNSMS_PASSWORD.",
    );
    process.exit(1);
  }

  await page.waitForSelector("#success_total_sms", { timeout: 30000 });
  console.log("ADNSMS login succeeded — dashboard loaded.");
} catch (err) {
  console.error("ADNSMS login test failed:", err.message);
  process.exit(1);
} finally {
  await browser.close();
}
