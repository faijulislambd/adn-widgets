import type { ReportData, ReportSettings } from "@/types/report-builder"

interface Entry {
  data: ReportData
  settings: ReportSettings
  expiry: number
}

const store = new Map<string, Entry>()

export function storeRenderData(data: ReportData, settings: ReportSettings): string {
  const id = crypto.randomUUID()
  store.set(id, { data, settings, expiry: Date.now() + 120_000 }) // 2-min TTL
  // Prune expired entries opportunistically
  for (const [k, v] of store) if (v.expiry < Date.now()) store.delete(k)
  return id
}

export function getRenderData(id: string): Entry | null {
  const entry = store.get(id)
  if (!entry || entry.expiry < Date.now()) {
    store.delete(id)
    return null
  }
  return entry
}
