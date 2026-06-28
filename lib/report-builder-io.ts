import type { ReportData } from "@/types/report-builder"

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

export function buildReportFilename(data: ReportData, ext: "json" | "pdf"): string {
  const platform = data.metadata.platform ?? "Incident"

  // Find the incident date-time field in INCIDENT_DETAILS
  const detailsGroup = data.groups.find((g) => g.predefinedId === "INCIDENT_DETAILS")
  const dtField = detailsGroup?.fields.find((f) => f.type === "date-time" && "value" in f)
  const rawValue = dtField && "value" in dtField ? (dtField as { value: string }).value : ""

  const date = rawValue ? new Date(rawValue) : new Date(data.metadata.generatedAt)
  const dd   = String(date.getDate()).padStart(2, "0")
  const mon  = MONTHS[date.getMonth()]
  const yy   = String(date.getFullYear()).slice(-2)
  const hh   = String(date.getHours()).padStart(2, "0")
  const mm   = String(date.getMinutes()).padStart(2, "0")

  return `${platform}-Incident-Report-${dd}-${mon}-${yy}-${hh}-${mm}.${ext}`
}

export function downloadReportAsJSON(data: ReportData, filename = "incident-report.json"): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function parseReportJSON(jsonString: string): ReportData | null {
  try {
    const parsed = JSON.parse(jsonString) as unknown
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "metadata" in parsed &&
      "groups" in parsed &&
      Array.isArray((parsed as ReportData).groups)
    ) {
      return parsed as ReportData
    }
    return null
  } catch {
    return null
  }
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}
