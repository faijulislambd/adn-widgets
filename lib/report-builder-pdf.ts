import type { ReportData, ReportSettings } from "@/types/report-builder"

export async function downloadReportAsPDF(
  data: ReportData,
  settings: ReportSettings,
  filename = "incident-report.pdf",
): Promise<void> {
  const response = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, settings }),
  })

  if (!response.ok) {
    throw new Error(`PDF generation failed: ${response.statusText}`)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
