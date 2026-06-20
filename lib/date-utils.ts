import { format, isValid } from "date-fns"

export function formatDateTimeDisplay(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (!isValid(d)) return ""
  return format(d, "dd MMMM, yyyy 'at' HH:mm")
}
