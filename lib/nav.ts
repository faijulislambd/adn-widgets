import { LayoutTemplate, SquareTerminal } from "lucide-react";
import type { NavItem } from "@/types";

export const navItems: NavItem[] = [
  { title: "Dashboard", icon: SquareTerminal, url: "/" },
  {
    title: "Widgets",
    icon: LayoutTemplate,
    items: [
      { label: "Daily Report", href: "/widgets/daily-report" },
      { label: "SMS Word Count", href: "/widgets/sms-word-count" },
      { label: "Report Builder", href: "/widgets/report-builder" },
      {
        label: "Telco SMS Consumption",
        href: "/widgets/telco-sms-consumption",
      },
      // { label: "SMS API Tester", href: "/widgets/sms-api-tester" },
      // { label: "Monthly Report", href: "/widgets/monthly-report" },
    ],
  },
];

export function getBreadcrumb(
  pathname: string,
): { parent: string; label: string } | null {
  for (const item of navItems) {
    if (item.items) {
      const child = item.items.find((c) => c.href === pathname);
      if (child) return { parent: item.title, label: child.label };
    }
  }
  return null;
}
