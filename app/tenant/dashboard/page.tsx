"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useMyRoom } from "@/hooks/use-auth"
import { ApiClientError } from "@/lib/api/types"
import { TENANT_LOGIN } from "@/lib/auth/guard"
import { formatIDR } from "@/lib/format"
import { useAuthStore } from "@/stores/auth-store"

// Minimal tenant landing. Its real purpose in the auth module is to exercise the
// tenant guard and GET /my-room; the full portal ships in a later module.
export default function TenantDashboardPage() {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const { data, isPending, isError, error } = useMyRoom()

  function onLogout() {
    logout()
    router.replace(TENANT_LOGIN)
  }

  const notFound = error instanceof ApiClientError && error.status === 404

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col gap-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My room</h1>
        <Button variant="outline" onClick={onLogout}>
          Sign out
        </Button>
      </div>

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
              {notFound ? "No room assigned yet" : "Unable to load your room"}
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
            <CardTitle className="text-xl">Room {data.room_number}</CardTitle>
            <CardDescription>Your current room assignment</CardDescription>
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
  )
}
