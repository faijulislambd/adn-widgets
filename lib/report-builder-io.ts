import type { ReportData } from "@/types/report-builder"

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
