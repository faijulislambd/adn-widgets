# ADN Widgets

Internal dashboard and tooling for ADN DigiNet's SMS platform — live status widgets, an incident report builder, and SMS billing calculators, built on Next.js App Router.

## Features

### Dashboard (`/`)
- SMS status pie charts (success/failed/pending, mask vs non-mask breakdown).
- Top clients combo chart — total SMS per company (bar) and SMS per client (line).
- "Last updated" badge that stays in sync across the whole app (see [Data freshness](#data-freshness) below).
- Per-card manual refresh buttons.

### Daily Report (`/widgets/daily-report`)
- ADN SMS panel status (success/failed/pending) and MetLife consumption status for the day.
- Top Clients table, grouped by company with each individual client's SMS volume underneath.
- "Copy For Teams" — formats the day's numbers as rich HTML for pasting into Microsoft Teams.
- Manual refresh (forces a live re-scrape rather than reading cache).

### Report Builder (`/widgets/report-builder`)
- Build incident reports from predefined groups (Incident Details, Affected System, Impact, Root Cause Analysis, Incident Response Team, Remediation, Communication, Lessons Learned, Closure) or custom fields (text, select, date-time, rich text, ordered list, team table).
- Company branding (logo, name, address) baked into the output.
- Exports to PDF via a headless-browser render of `/report-render`.

### SMS Word/Character Count (`/widgets/sms-word-count`)
- Counts characters/segments for English and Bangla text and reports the resulting SMS segment count.
- Mask vs non-mask rate and cost calculations, using per-segment character limits configured via env vars.

### Password gate
- Certain actions are gated by a password fetched from `NEXT_PUBLIC_PASSWORD_URL` at runtime, falling back to a default if that address is unreachable or returns nothing usable (`lib/password.ts`).

## Data freshness

SMS platform data (ADNSMS + MetLife) is cached in Upstash Redis rather than scraped on every page view. Three things keep it fresh:

1. **On first visit** to the dashboard or the daily report page, the page forces a live scrape rather than trusting whatever's cached, since the background cron (below) isn't guaranteed to be recent.
2. **A GitHub Actions workflow** (`.github/workflows/scrape-reports.yml`) scrapes both sources in the background on a best-effort ~10-minute schedule and writes the result to Redis. GitHub's own scheduler can lag this by hours under load — it's a backstop, not the primary freshness guarantee. Each run first checks the existing cache and skips scraping entirely if it's under 5 minutes old, so it doesn't do redundant work right after a manual refresh.
3. **Manual refresh** (any refresh button in the UI) always forces a fresh scrape and updates Redis immediately, and broadcasts a `report-data-refreshed` browser event so every "last updated" indicator on the page updates instantly instead of waiting for its own poll cycle.

Live scraping itself runs through `lib/browser.ts`, which prefers a locally installed Chrome (for local dev or a full VM) and otherwise falls back to `@sparticuz/chromium-min` — a Chromium build made for serverless platforms like Vercel. This is why the app is deployed on Vercel rather than shared hosting (e.g. cPanel): shared hosts typically block spawning native browser binaries entirely, which headless scraping requires.

## Project structure

```
app/
  page.tsx                    Dashboard
  widgets/
    daily-report/             Daily Report page
    report-builder/           Incident report builder
    sms-word-count/           SMS character/cost calculator
  report-render/               Headless-render target used only for PDF generation
  api/
    daily-report-data/        ADNSMS daily stats (Redis-cached, ?force=true for a live scrape)
    metlife-report/           MetLife consumption stats (same caching pattern)
    monthly-report-data/      On hold — kept for a future rebuild, not currently linked in the UI
    generate-pdf/             Renders /report-render to PDF via a headless browser
    report-data/[id]/         Serves report data to the headless-rendered PDF page

components/
  dashboard/                  Charts, ClientChart, per-chart primitives
  daily-update/               Status cards, top-clients table, shared headers
  Utils/DataLastUpdated.tsx   Cross-page "last updated" indicator
  report-builder/, ui/, ...

lib/
  browser.ts                  Headless Chromium launcher (local Chrome or chromium-min)
  redis.ts                    Upstash-backed report cache (degrades gracefully if unconfigured)
  group-companies.ts          Groups raw client rows by company, with per-client SMS totals
  password.ts                 Remote password fetch with fallback
  report-builder-*.ts         Report builder config/io/pdf/storage helpers

.github/
  workflows/
    scrape-reports.yml        Background scrape cron (see Data freshness)
    test-secrets.yml          Manually-triggered check that GH secrets/vars/logins actually work
  scripts/
    scrape-*.mjs              Scripts run by scrape-reports.yml
    test-*-login.mjs          Scripts run by test-secrets.yml
```

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

| Variable | Purpose |
|---|---|
| `ADNSMS_URL`, `ADNSMS_EMAIL`, `ADNSMS_PASSWORD` | Login for the ADNSMS portal scrape |
| `METLIFE_URL`, `METLIFE_EMAIL`, `METLIFE_PASSWORD` | Login for the MetLife consumption report scrape |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Redis cache for scraped report data |
| `ADNSMS_ENGLISH_1_SMS_COUNT`, `ADNSMS_ENGLISH_MORE_SMS_COUNT`, `ADNSMS_BANGLA_1_SMS_COUNT`, `ADNSMS_BANGLA_MORE_SMS_COUNT` | Per-segment character limits for the SMS word-count calculator |
| `NEXT_PUBLIC_PASSWORD_URL` | Remote source for the action password (optional — falls back to a default) |
| `CHROME_EXECUTABLE_PATH`, `CHROMIUM_CACHE_DIR`, `CHROMIUM_PACK_URL` | Optional overrides for `lib/browser.ts` on non-Vercel hosts |

The same ADNSMS/MetLife/Upstash credentials also need to exist as GitHub Actions secrets/variables (under the `adn-widget` environment) for the background scrape workflow — see `.github/workflows/scrape-reports.yml`.

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build
npm run start    # run a production build
npm run lint     # eslint
```

## Deployment

- **App**: deployed on Vercel (connected to this GitHub repo — pushes to `main` auto-deploy). Requires all environment variables above to be set in the Vercel project settings.
- **Background scraper**: runs on GitHub Actions, independent of where the app is hosted — see [Data freshness](#data-freshness).
- Note: this repo is public, so Actions logs are visible to anyone. The scrape scripts deliberately never log scraped client names or figures, only row counts.
