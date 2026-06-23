import puppeteer from "puppeteer"
import { storeRenderData } from "@/lib/report-render-store"
import type { ReportData, ReportSettings } from "@/types/report-builder"

export async function POST(request: Request) {
  let data: ReportData
  let settings: ReportSettings

  try {
    const body = await request.json()
    data = body.data
    settings = body.settings
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const id = storeRenderData(data, settings)

  const host = request.headers.get("host") ?? "localhost:3000"
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  const renderUrl = `${protocol}://${host}/report-render?id=${id}`

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 })

    await page.goto(renderUrl, { waitUntil: "networkidle0", timeout: 30_000 })

    // Wait until the React layout effect has computed page breaks
    await page.waitForSelector("[data-layout-complete]", { timeout: 15_000 })

    // One extra animation frame so the final re-render is painted
    await page.evaluate(
      () => new Promise<void>((r) => requestAnimationFrame(() => { r() })),
    )

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })

    return new Response(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="incident-report.pdf"',
      },
    })
  } finally {
    await browser.close()
  }
}
