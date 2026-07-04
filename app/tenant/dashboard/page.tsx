"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useMyRoom } from "@/hooks/use-auth"
import { ApiClientError } from "@/lib/api/types"
import { TENANT_LOGIN } from "@/lib/auth/guard"
import { formatIDR } from "@/lib/format"
import { useAuthStore } from "@/stores/auth-store"

export default function TenantDashboardPage() {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const { data, isPending, isError, error } = useMyRoom()

  // The client clears tokens on a terminal 401, but the middleware guard only
  // runs on navigation — so a session that dies while on this page must send the
  // tenant back to login itself.
  const unauthorized =
    error instanceof ApiClientError &&
    (error.status === 401 || error.status === 403)

  useEffect(() => {
    if (unauthorized) {
      logout()
      router.replace(TENANT_LOGIN)
    }
  }, [unauthorized, logout, router])

  const notFound = error instanceof ApiClientError && error.status === 404

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
              <h1 className="text-2xl font-bold">My room</h1>

              {isPending ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-40" />
                  </CardContent>
                </Card>
              ) : isError ? (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {notFound
                        ? "No room assigned yet"
                        : "Unable to load your room"}
                    </CardTitle>
                    <CardDescription>
                      {notFound
                        ? "You do not have an active room assignment right now."
                        : error instanceof ApiClientError
                          ? error.message
                          : "Please try again in a moment."}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Room {data.room_number}
                    </CardTitle>
                    <CardDescription>
                      Your current room assignment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-base">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Monthly rent</span>
                      <span className="font-semibold">
                        {formatIDR(data.monthly_rent)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
