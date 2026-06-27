import puppeteer, { Browser } from "puppeteer-core";
import { existsSync } from "fs";
import { join } from "path";

const CHROME_PATHS: string[] = process.platform === "win32"
  ? [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    ]
  : [
      "/usr/bin/google-chrome",
      "/usr/bin/google-chrome-stable",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/snap/bin/chromium",
      "/usr/local/bin/chromium",
    ];

function findSystemChrome(): string | null {
  if (process.env.CHROME_EXECUTABLE_PATH) {
    return process.env.CHROME_EXECUTABLE_PATH;
  }
  for (const path of CHROME_PATHS) {
    if (existsSync(path)) return path;
  }
  return null;
}

let cachedBrowser: Browser | null = null;

async function launchBrowser(): Promise<Browser> {
  const systemChrome = findSystemChrome();
  if (systemChrome) {
    return puppeteer.launch({
      executablePath: systemChrome,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
  }

  const chromium = await import("@sparticuz/chromium-min");

  // Local bundle path (Netlify included_files) — no network download needed
  const localTar = join(process.cwd(), "public", "chromium-v149.0.0-pack.x64.tar");
  const chromiumSource = existsSync(localTar)
    ? localTar
    : `${process.env.URL || process.env.DEPLOY_URL}/${localTar.split("/").pop()}`;

  if (!existsSync(localTar) && !process.env.URL && !process.env.DEPLOY_URL) {
    throw new Error(
      "No Chrome found. On cPanel: install chromium. On Netlify: deploy the project with chromium tar in public/."
    );
  }

  return puppeteer.launch({
    args: chromium.default.args,
    defaultViewport: { width: 1280, height: 720 },
    executablePath: await chromium.default.executablePath(chromiumSource),
    headless: true,
  });
}

export async function getBrowser(): Promise<Browser> {
  if (cachedBrowser && cachedBrowser.connected) {
    return cachedBrowser;
  }
  cachedBrowser = await launchBrowser();
  return cachedBrowser;
}
