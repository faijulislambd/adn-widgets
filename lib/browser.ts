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

const CHROME_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--disable-extensions",
  "--disable-background-networking",
  "--disable-sync",
  "--no-first-run",
  "--single-process",
];

function findSystemChrome(): string | null {
  if (process.env.CHROME_EXECUTABLE_PATH) return process.env.CHROME_EXECUTABLE_PATH;
  for (const p of CHROME_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function launchBrowser(): Promise<Browser> {
  const systemChrome = findSystemChrome();
  if (systemChrome) {
    return puppeteer.launch({
      executablePath: systemChrome,
      headless: true,
      args: CHROME_ARGS,
    });
  }

  const chromium = await import("@sparticuz/chromium-min");

  // On Netlify, always use the remote URL so concurrent invocations don't
  // hit ETXTBSY from two processes extracting the same tar to /tmp at once.
  const localTar = join(process.cwd(), "public", "chromium-v149.0.0-pack.x64.tar");
  const onNetlify = !!(process.env.NETLIFY || process.env.URL);
  const chromiumSource =
    !onNetlify && existsSync(localTar)
      ? localTar
      : `${process.env.URL || process.env.DEPLOY_URL}/chromium-v149.0.0-pack.x64.tar`;

  return puppeteer.launch({
    args: chromium.default.args,
    defaultViewport: { width: 1280, height: 720 },
    executablePath: await chromium.default.executablePath(chromiumSource),
    headless: true,
  });
}

let cachedBrowser: Browser | null = null;
let launchPromise: Promise<Browser> | null = null;

export async function getBrowser(): Promise<Browser> {
  if (cachedBrowser?.connected) {
    return cachedBrowser;
  }

  // Serialize concurrent launch calls so only one extraction runs at a time.
  if (launchPromise) {
    return launchPromise;
  }

  if (cachedBrowser) {
    try { await cachedBrowser.close(); } catch {}
    cachedBrowser = null;
  }

  launchPromise = launchBrowser().then((browser) => {
    cachedBrowser = browser;
    launchPromise = null;
    browser.once("disconnected", () => { cachedBrowser = null; });
    return browser;
  }).catch((err) => {
    launchPromise = null;
    throw err;
  });

  return launchPromise;
}
