"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { PanelLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type SidebarContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggleSidebar: () => void
  collapsible?: "icon" | "none"
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider.")
  }
  return context
}

function SidebarProvider({
  defaultOpen = true,
  children,
}: {
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(defaultOpen)

  // On mobile start closed to avoid overlay covering content on first load
  React.useEffect(() => {
    if (window.innerWidth < 768) setOpen(false)
  }, [])

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      toggleSidebar: () => setOpen((current) => !current),
      collapsible: "icon" as const,
    }),
    [open]
  )

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={0}>
        <div
          data-collapsible={open ? "" : "icon"}
          className="group/sidebar-wrapper flex min-h-svh w-full bg-background"
          style={
            {
              "--sidebar-width": "16rem",
              "--sidebar-width-icon": "3.25rem",
            } as React.CSSProperties
          }
        >
          {/* Mobile backdrop — click outside to close */}
          <div
            onClick={() => setOpen(false)}
            className={cn(
              "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
              open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
          />
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  className,
  collapsible = "icon",
  ...props
}: React.ComponentProps<"aside"> & { collapsible?: "icon" | "none" }) {
  const { open } = useSidebar()

  return (
    <aside
      data-collapsible={open || collapsible === "none" ? "" : "icon"}
      className={cn(
        "group/sidebar min-h-svh w-[var(--sidebar-width)] shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        // Mobile: fixed drawer, slides in/out from left
        "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-linear",
        open ? "translate-x-0" : "-translate-x-full",
        // Desktop: inline block, animate width instead of translate
        "md:static md:z-auto md:block md:translate-x-0 md:transition-[width] md:duration-200",
        !open && collapsible === "icon" && "md:w-[var(--sidebar-width-icon)]",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      className={cn("relative flex min-h-svh flex-1 flex-col", className)}
      {...props}
    />
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft className="size-4" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-2 group-data-[collapsible=icon]/sidebar:p-2", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-auto p-2", className)} {...props} />
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("relative flex w-full flex-col", className)} {...props} />
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-2 py-1 text-xs font-medium text-sidebar-foreground/70 transition-opacity group-data-[collapsible=icon]/sidebar:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("group/menu-item relative", className)} {...props} />
}

function SidebarMenuButton({
  asChild = false,
  size = "default",
  tooltip,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  size?: "default" | "lg"
  tooltip?: string
}) {
  const { open } = useSidebar()
  const Comp = asChild ? Slot : "button"
  const button = (
    <Comp
      className={cn(
        "flex w-full items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring [&>svg]:shrink-0",
        size === "default" ? "h-8" : "h-12",
        !open && "justify-center px-0 [&>span:not(:first-child)]:hidden [&_.ml-auto]:hidden",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )

  if (!tooltip || open) {
    return button
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-1 group-data-[collapsible=icon]/sidebar:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return <li className={cn("relative", className)} {...props} />
}

function SidebarMenuSubButton({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      className={cn(
        "flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground/85 outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}
