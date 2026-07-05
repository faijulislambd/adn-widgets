import puppeteer from "puppeteer";

const email = process.env.METLIFE_EMAIL;
const password = process.env.METLIFE_PASSWORD;
const url = process.env.METLIFE_URL;

if (!email || !password || !url) {
  console.error("Missing METLIFE_EMAIL, METLIFE_PASSWORD, or METLIFE_URL");
  process.exit(1);
}

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const emailField = await page.$("[type='email']");
  if (emailField) {
    await page.type("[type='email']", email);
    await page.waitForSelector("[type='password']");
    await page.type("[type='password']", password);
    await page.waitForSelector(".btn");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click(".btn"),
    ]);
  }

  const stillOnLogin = await page.$("[type='email']");
  if (stillOnLogin) {
    console.error(
      "Login failed — still on login page after submit. Check METLIFE_EMAIL/METLIFE_PASSWORD.",
    );
    process.exit(1);
  }

  await page.waitForSelector("#period", { timeout: 30000 });
  console.log("METLIFE login succeeded — report page loaded.");
} catch (err) {
  console.error("METLIFE login test failed:", err.message);
  process.exit(1);
} finally {
  await browser.close();
}
