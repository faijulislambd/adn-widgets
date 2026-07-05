import puppeteer, { Browser } from "puppeteer-core";
import { existsSync } from "fs";

// @sparticuz/chromium-min ships no binary of its own -- it only knows how to
// fetch the matching Chromium pack over http(s) and cache it to /tmp on first
// use (a plain filesystem path is silently mistreated as an extracted bin dir
// and fails). Point it at the official pinned GitHub release: the version tag
// makes it a permanent asset that won't disappear or drift like a "latest"
// link would, so hosts with no local Chrome (e.g. cPanel) get a stable source.
//
// Pinned (exact, not caret) to 147.0.0 in package.json: 147.0.1+ raised the
// minimum Node version to 22.17, which cPanel's Node 20 selector can't run.
// Keep this version in sync with the @sparticuz/chromium-min version above.
const CHROMIUM_MIN_VERSION = "147.0.0";
const DEFAULT_CHROMIUM_PACK_URL = `https://github.com/Sparticuz/chromium/releases/download/v${CHROMIUM_MIN_VERSION}/chromium-v${CHROMIUM_MIN_VERSION}-pack.x64.tar`;

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

  // cPanel (and many shared hosts) mount /tmp with noexec, so Chromium
  // extracted there cannot be spawned. Override TMPDIR/TMP before the
  // sparticuz package resolves its cache path so extraction lands in a
  // home-directory folder where execution IS permitted.
  // Set CHROMIUM_CACHE_DIR in cPanel's Node.js app environment variables.
  const cacheDir = process.env.CHROMIUM_CACHE_DIR;
  if (cacheDir) {
    process.env.TMPDIR = cacheDir;
    process.env.TMP    = cacheDir;
    process.env.TEMP   = cacheDir;
  }

  const chromium = await import("@sparticuz/chromium-min");
  const chromiumPackUrl = process.env.CHROMIUM_PACK_URL || DEFAULT_CHROMIUM_PACK_URL;

  return puppeteer.launch({
    args: chromium.default.args,
    defaultViewport: { width: 1280, height: 720 },
    executablePath: await chromium.default.executablePath(chromiumPackUrl),
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
