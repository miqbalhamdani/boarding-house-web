"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { PaymentSourceBadge } from "@/components/payments/payment-source-badge"
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
import { usePayment } from "@/hooks/use-payments"
import { errorMessage } from "@/lib/api/errors"
import { ApiClientError } from "@/lib/api/types"
import { PAYMENT_METHOD_LABEL } from "@/lib/payments/schemas"
import { formatIDR } from "@/lib/format"

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-base text-muted-foreground">{label}</dt>
      <dd className="text-base font-medium">{value}</dd>
    </div>
  )
}

// YYYY-MM → "July 2026".
function formatMonth(iso?: string): string {
  if (!iso) return "—"
  const parsed = new Date(`${iso}-01T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
}

// RFC3339 → "10 July 2026, 17.00".
function formatPaymentDate(iso: string): string {
  if (!iso) return "—"
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Full timestamp for the record metadata card.
function formatTimestamp(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("id-ID")
}

function roomLabel(roomNumber?: string, roomName?: string): string {
  const parts = [roomNumber, roomName].filter(Boolean)
  return parts.length ? parts.join(" · ") : "—"
}

export function PaymentDetail({ id }: { id: string }) {
  const payment = usePayment(id)

  if (payment.isPending) {
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

  if (payment.isError || !payment.data) {
    const notFound =
      payment.error instanceof ApiClientError && payment.error.status === 404
    return (
      <div className="px-4 py-6 lg:px-6">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <p className="text-lg font-medium">
            {notFound ? "Payment not found" : "Could not load payment"}
          </p>
          {!notFound && (
            <p className="text-base text-muted-foreground">
              {errorMessage(payment.error)}
            </p>
          )}
          <Button asChild variant="outline">
            <Link href="/owner/payments">Back to payments</Link>
          </Button>
        </div>
      </div>
    )
  }

  const data = payment.data

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <Breadcrumb>
        <BreadcrumbList className="text-base">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/owner/payments">Payments</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{data.tenant_name || "Payment"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {data.tenant_name || "Payment"}
          </h1>
          <p className="text-muted-foreground text-base">
            {formatMonth(data.billing_month)} rent
          </p>
        </div>
        <Button asChild variant="ghost" size="lg">
          <Link href="/owner/payments">
            <ArrowLeftIcon />
            Back to payments
          </Link>
        </Button>
      </div>

      {/* Highlight band — amount and source. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Amount paid
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-3xl font-bold tabular-nums">
              {formatIDR(data.amount)}
            </p>
            <p className="text-base text-muted-foreground">
              {formatPaymentDate(data.payment_date)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Source
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div>
              <PaymentSourceBadge source={data.payment_source} />
            </div>
            <p className="text-base text-muted-foreground">
              {data.payment_source === "manual"
                ? "Recorded manually by the owner."
                : "Confirmed by a verified gateway payment."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details + record metadata. */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payment information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <InfoRow label="Tenant" value={data.tenant_name || "—"} />
              <InfoRow
                label="Room"
                value={roomLabel(data.room_number, data.room_name)}
              />
              <InfoRow
                label="Billing month"
                value={formatMonth(data.billing_month)}
              />
              <InfoRow label="Amount" value={formatIDR(data.amount)} />
              <InfoRow
                label="Method"
                value={PAYMENT_METHOD_LABEL[data.payment_method]}
              />
              <InfoRow
                label="Source"
                value={<PaymentSourceBadge source={data.payment_source} />}
              />
              <InfoRow
                label="Payment date"
                value={formatPaymentDate(data.payment_date)}
              />
              <InfoRow
                label="Reference number"
                value={data.reference_number || "—"}
              />
              <InfoRow label="Notes" value={data.notes || "—"} />
              <InfoRow
                label="Bill"
                value={
                  <Link
                    href={`/owner/bills/${data.bill_id}`}
                    className="text-foreground underline underline-offset-4"
                  >
                    View bill
                  </Link>
                }
              />
              {data.gateway_transaction_id ? (
                <InfoRow
                  label="Gateway transaction"
                  value={
                    <span className="font-mono text-sm">
                      {data.gateway_transaction_id}
                    </span>
                  }
                />
              ) : null}
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Record</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <InfoRow
                label="Created"
                value={formatTimestamp(data.created_at)}
              />
              <InfoRow
                label="Updated"
                value={formatTimestamp(data.updated_at)}
              />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
