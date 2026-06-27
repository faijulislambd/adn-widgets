import { getBrowser } from "@/lib/browser"
import { storeRenderData } from "@/lib/report-render-store"
import type { ReportData, ReportSettings } from "@/types/report-builder"

export const maxDuration = 60

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

  const browser = await getBrowser()

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 })

    await page.goto(renderUrl, { waitUntil: "load", timeout: 30_000 })

    await page.waitForSelector("[data-layout-complete]", { timeout: 15_000 })

    await page.evaluate(
      () => new Promise<void>((r) => requestAnimationFrame(() => { r() })),
    )

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })

    const platform = (data.metadata.platform ?? "unknown").toLowerCase().replace(/[^a-z0-9]/g, "-")
    const date = data.metadata.generatedAt
      ? new Date(data.metadata.generatedAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
    const filename = `incident-report-${platform}-${date}.pdf`

    return new Response(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } finally {
    await browser.close()
  }
}
