import { LayoutTemplate, SquareTerminal } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavChild = { label: string; href: string }

export type NavItem =
  | { title: string; icon: LucideIcon; url: string; items?: never }
  | { title: string; icon: LucideIcon; url?: never; items: NavChild[] }

export const navItems: NavItem[] = [
  { title: "Dashboard", icon: SquareTerminal, url: "/" },
  {
    title: "Widgets",
    icon: LayoutTemplate,
    items: [
      { label: "Report Builder", href: "/widgets/report-builder" },
      { label: "Daily Report", href: "/widgets/daily-report" },
    ],
  },
]

export function getBreadcrumb(pathname: string): { parent: string; label: string } | null {
  for (const item of navItems) {
    if (item.items) {
      const child = item.items.find((c) => c.href === pathname)
      if (child) return { parent: item.title, label: child.label }
    }
  }
  return null
}
