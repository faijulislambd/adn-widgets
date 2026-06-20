import type { ReportData, ReportSettings, SelectOption } from '@/types/report-builder'

const REPORT_KEY = 'report-builder-data'
const SETTINGS_KEY = 'report-builder-settings'
const SELECT_OPTIONS_KEY = 'report-builder-select-options'

export function loadReport(): ReportData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(REPORT_KEY)
    return raw ? (JSON.parse(raw) as ReportData) : null
  } catch {
    return null
  }
}

export function saveReport(data: ReportData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(REPORT_KEY, JSON.stringify(data))
}

export function loadSettings(): ReportSettings | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? (JSON.parse(raw) as ReportSettings) : null
  } catch {
    return null
  }
}

export function saveSettings(settings: ReportSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function loadSelectOptions(fieldId: string): SelectOption[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`${SELECT_OPTIONS_KEY}-${fieldId}`)
    return raw ? (JSON.parse(raw) as SelectOption[]) : []
  } catch {
    return []
  }
}

export function saveSelectOptions(fieldId: string, options: SelectOption[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${SELECT_OPTIONS_KEY}-${fieldId}`, JSON.stringify(options))
}
