"use client";

import {
  Bot,
  ChevronRight,
  Command,
  FolderKanban,
  LifeBuoy,
  Settings2,
  ShieldCheck,
  SquareTerminal,
  LayoutTemplate,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { url } from "inspector";

const menu = [
  {
    title: "Dashboard",
    icon: SquareTerminal,
    url: "/",
    items: [
      { label: "Dashboard", href: "/" },
      { label: "Jobs", href: "#" },
      { label: "Logs", href: "#" },
    ],
  },
  {
    title: "Widgets",
    icon: LayoutTemplate,
    items: [{ label: "Report Builder", href: "/widgets/report-builder" }],
  },
  {
    title: "Automation",
    icon: Bot,
    items: [
      { label: "Rules", href: "#" },
      { label: "Schedules", href: "#" },
      { label: "Approvals", href: "#" },
    ],
  },
  {
    title: "Projects",
    icon: FolderKanban,
    items: [
      { label: "Active", href: "#" },
      { label: "Archived", href: "#" },
      { label: "Templates", href: "#" },
    ],
  },
  {
    title: "Security",
    icon: ShieldCheck,
    items: [
      { label: "Password Gate", href: "#" },
      { label: "Audit Trail", href: "#" },
      { label: "Policies", href: "#" },
    ],
  },
  {
    title: "Settings",
    icon: Settings2,
    items: [
      { label: "General", href: "#" },
      { label: "Team", href: "#" },
      { label: "Billing", href: "#" },
    ],
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#home">
                <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </span>
                <span className="grid text-left text-sm leading-tight">
                  <span className="font-semibold">ADN Auto</span>
                  <span className="text-xs">Operations</span>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarMenu>
            {menu.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={
                  item.title === "Platform" || item.title === "Widgets"
                }
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((child) => (
                        <SidebarMenuSubItem key={child.label}>
                          <SidebarMenuSubButton asChild>
                            <a href={child.href}>
                              <span>{child.label}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Support">
              <LifeBuoy className="size-4" />
              <span>Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
