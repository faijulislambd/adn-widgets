import { AppSidebar } from "@/components/app-sidebar"
import { PasswordStatus } from "@/components/password-status"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Home() {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Operations</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-4 text-card-foreground">
              <p className="text-sm text-muted-foreground">Active jobs</p>
              <p className="mt-2 text-3xl font-semibold">24</p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-card-foreground">
              <p className="text-sm text-muted-foreground">Queue health</p>
              <p className="mt-2 text-3xl font-semibold">98%</p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-card-foreground">
              <p className="text-sm text-muted-foreground">Protected state</p>
              <PasswordStatus />
            </div>
          </section>
          <section className="min-h-[50vh] rounded-lg border bg-card p-6 text-card-foreground">
            <h1 className="text-2xl font-semibold tracking-normal">
              Starter dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              This page is wired with a collapsible shadcn-style sidebar,
              Redux Toolkit, and a password helper that falls back to
              techops2026 when your configured address is unavailable.
            </p>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
