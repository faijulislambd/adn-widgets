import { writeFileSync, readFileSync, existsSync, unlinkSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import type { ReportData, ReportSettings } from "@/types/report-builder"

interface Entry {
  data: ReportData
  settings: ReportSettings
  expiry: number
}

function entryPath(id: string) {
  return join(tmpdir(), `report-render-${id}.json`)
}

export function storeRenderData(data: ReportData, settings: ReportSettings): string {
  const id = crypto.randomUUID()
  const entry: Entry = { data, settings, expiry: Date.now() + 120_000 }
  writeFileSync(entryPath(id), JSON.stringify(entry), "utf-8")
  return id
}

export function getRenderData(id: string): Entry | null {
  const path = entryPath(id)
  if (!existsSync(path)) return null
  try {
    const entry = JSON.parse(readFileSync(path, "utf-8")) as Entry
    if (entry.expiry < Date.now()) {
      unlinkSync(path)
      return null
    }
    return entry
  } catch {
    return null
  }
}
