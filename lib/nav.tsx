import { DoorOpenIcon, LayoutDashboardIcon, UsersIcon } from "lucide-react"

export type NavItem = {
  title: string
  url: string
  icon?: React.ReactNode
}

export type Role = "owner" | "tenant"

type ShellConfig = {
  brand: string
  headerTitle: string
  navMain: NavItem[]
}

export const shellConfig: Record<Role, ShellConfig> = {
  owner: {
    brand: "Second House",
    headerTitle: "Owner",
    navMain: [
      { title: "Dashboard", url: "/owner/dashboard", icon: <LayoutDashboardIcon /> },
      { title: "Rooms", url: "/owner/rooms", icon: <DoorOpenIcon /> },
      { title: "Tenants", url: "/owner/tenants", icon: <UsersIcon /> },
    ],
  },
  tenant: {
    brand: "Second House",
    headerTitle: "My Portal",
    navMain: [
      { title: "Dashboard", url: "/tenant/dashboard", icon: <LayoutDashboardIcon /> },
    ],
  },
}
