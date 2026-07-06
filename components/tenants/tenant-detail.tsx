"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { useState } from "react"

import { AssignRoomDialog } from "@/components/onboarding/assign-room-dialog"
import { TenantFormDialog } from "@/components/tenants/tenant-form"
import { TenantStatusBadge } from "@/components/tenants/tenant-status-badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTenant } from "@/hooks/use-tenants"
import { errorMessage } from "@/lib/api/errors"
import { ApiClientError } from "@/lib/api/types"
import type { TenantStatus } from "@/services/tenants"

// Static UI copy describing what each status means operationally, so status is
// not conveyed by the badge colour alone.
const STATUS_HELP: Record<TenantStatus, string> = {
  pending_payment: "Awaiting the first rent payment before becoming active.",
  active: "Currently renting — first rent bill has been paid.",
  moved_out: "Has moved out; no longer occupies a room.",
  cancelled: "Onboarding was cancelled before moving in.",
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-base text-muted-foreground">{label}</dt>
      <dd className="text-base font-medium">{value}</dd>
    </div>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("id-ID")
}

export function TenantDetail({ id }: { id: string }) {
  const tenant = useTenant(id)
  const [editOpen, setEditOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)

  if (tenant.isPending) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <Skeleton className="h-5 w-40" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-11 w-40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 w-full lg:col-span-2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (tenant.isError || !tenant.data) {
    const notFound =
      tenant.error instanceof ApiClientError && tenant.error.status === 404
    return (
      <div className="px-4 py-6 lg:px-6">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <p className="text-lg font-medium">
            {notFound ? "Tenant not found" : "Could not load tenant"}
          </p>
          {!notFound && (
            <p className="text-base text-muted-foreground">
              {errorMessage(tenant.error)}
            </p>
          )}
          <Button asChild variant="outline">
            <Link href="/owner/tenants">Back to tenants</Link>
          </Button>
        </div>
      </div>
    )
  }

  const data = tenant.data

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <Breadcrumb>
        <BreadcrumbList className="text-base">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/owner/tenants">Tenants</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{data.full_name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{data.full_name}</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="lg">
            <Link href="/owner/tenants">
              <ArrowLeftIcon />
              Back to tenants
            </Link>
          </Button>
          <Button size="lg" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
        </div>
      </div>

      {/* Highlight band — the two most operationally important facts. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div>
              <TenantStatusBadge status={data.status} />
            </div>
            <p className="text-base text-muted-foreground">
              {STATUS_HELP[data.status]}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Portal access
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-3xl font-bold">
              {data.has_portal_access ? "Yes" : "No"}
            </p>
            <p className="text-base text-muted-foreground">
              {data.has_portal_access
                ? "This tenant can sign in to the tenant portal."
                : "No portal login yet — add a password when editing to enable it."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details + record metadata. */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tenant information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <InfoRow label="Full name" value={data.full_name} />
              <InfoRow label="Phone number" value={data.phone_number || "—"} />
              <InfoRow label="Email" value={data.email || "—"} />
              <InfoRow
                label="Identity number"
                value={data.identity_number || "—"}
              />
              <InfoRow
                label="Emergency contact"
                value={
                  data.emergency_contact_name || data.emergency_contact_phone
                    ? `${data.emergency_contact_name || "—"} · ${
                        data.emergency_contact_phone || "—"
                      }`
                    : "—"
                }
              />
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Record</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <InfoRow label="Created" value={formatDate(data.created_at)} />
              <InfoRow label="Updated" value={formatDate(data.updated_at)} />
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Current assignment is the onboarding entry point: assign this tenant to a
          room (creates the first bill, reserves the room). The billing summary
          remains a placeholder until the billing module is built. */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-10 text-center">
              <div className="flex flex-col gap-1">
                <p className="text-base font-medium">Not assigned to a room</p>
                <p className="text-base text-muted-foreground">
                  Assign {data.full_name} to an available room to start
                  onboarding and create the first rent bill.
                </p>
              </div>
              <Button size="lg" onClick={() => setAssignOpen(true)}>
                Assign a room
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Billing summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed py-10 text-center">
              <p className="text-base font-medium">No billing yet</p>
              <p className="text-base text-muted-foreground">
                Bills and payments will appear here once the billing module is
                available.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <TenantFormDialog
        mode="edit"
        id={data.id}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <AssignRoomDialog
        tenant={data}
        open={assignOpen}
        onOpenChange={setAssignOpen}
      />
    </div>
  )
}
