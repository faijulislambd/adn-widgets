import puppeteer from "puppeteer-core";
import { existsSync } from "fs";

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

export async function getBrowser() {
  // cPanel VPS: system Chrome auto-detect
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

  // Netlify: chromium tar public/ folder থেকে serve হয়
  // Netlify automatically sets process.env.URL = "https://your-site.netlify.app"
  const siteUrl = process.env.URL || process.env.DEPLOY_URL;
  if (!siteUrl) {
    throw new Error(
      "No Chrome found. On cPanel: install chromium. On Netlify: URL env var must be set."
    );
  }

  const chromiumUrl = `${siteUrl}/chromium-v149.0.0-pack.x64.tar`;
  const chromium = await import("@sparticuz/chromium-min");
  return puppeteer.launch({
    args: chromium.default.args,
    defaultViewport: { width: 1280, height: 720 },
    executablePath: await chromium.default.executablePath(chromiumUrl),
    headless: true,
  });
}
