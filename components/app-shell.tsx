import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { shellConfig, type Role } from "@/lib/nav"

export function AppShell({
  role,
  children,
}: {
  role: Role
  children: React.ReactNode
}) {
  const { navMain, brand, headerTitle } = shellConfig[role]

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 60)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" brand={brand} navMain={navMain} />
      <SidebarInset>
        <SiteHeader title={headerTitle} />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
