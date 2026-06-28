"use client";

import { ChevronRight, LifeBuoy } from "lucide-react";

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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import ADNLogoIcon from "@/assets/adn-diginet-icon.png";
import Image from "next/image";
import { navItems } from "@/lib/nav";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#home">
                <span className="flex size-8 items-center justify-center rounded-md bg-slate-200 text-sidebar-primary-foreground">
                  <Image
                    src={ADNLogoIcon}
                    alt="ADN DiGinet Ltd."
                    className="w-20"
                  />
                </span>
                <span className="grid text-left text-xl uppercase leading-tight">
                  <span className="font-semibold">ADN DiGinet Ltd.</span>
                  {/* <span className="text-xs">Operations</span> */}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const hasChildren =
                Array.isArray(item.items) && item.items.length > 0;

              return hasChildren ? (
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
                        {(item.items ?? []).map((child) => (
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
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a
                      href={item.url ?? "#"}
                      className="flex items-center gap-2 w-full"
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
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
