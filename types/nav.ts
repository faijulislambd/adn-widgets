import type { LucideIcon } from "lucide-react";

export type NavChild = { label: string; href: string };

export type NavItem =
  | { title: string; icon: LucideIcon; url: string; items?: never }
  | { title: string; icon: LucideIcon; url?: never; items: NavChild[] };
