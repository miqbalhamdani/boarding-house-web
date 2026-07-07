"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  ReceiptTextIcon,
} from "lucide-react"

import { PAY_BILL_SESSION_KEY } from "@/components/tenant/pay-now-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTenantBill } from "@/hooks/use-tenant"
import { useTenantAuthGuard } from "@/hooks/use-tenant-auth-guard"
import { ApiClientError } from "@/lib/api/types"

// Reads the bill id the Pay Now button stashed in sessionStorage. Modelled as an
// external store so the server snapshot is "" (avoiding a hydration mismatch) and
// the client reads the real value on mount — no setState-in-effect.
function useStashedBillId(): string {
  return useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return sessionStorage.getItem(PAY_BILL_SESSION_KEY) ?? ""
      } catch {
        return ""
      }
    },
    () => ""
  )
}

// The tenant lands here after the gateway redirects back. This page is NOT proof
// of payment (BR-026, project security rule): it only mirrors the bill status the
// backend reports, which flips to `paid` only after a verified webhook. Until
// then it shows "waiting for confirmation".
export function TenantPaymentResult({ billId }: { billId?: string }) {
  // The gateway redirect may not echo our bill id, so fall back to the id the
  // Pay Now button stashed in sessionStorage.
  const stashedId = useStashedBillId()
  const resolvedId = billId || stashedId

  const bill = useTenantBill(resolvedId)
  useTenantAuthGuard(bill.error)

  const status = bill.data?.status
  const confirmed = status === "paid"
  // A 404 means the id doesn't resolve to one of the tenant's bills — surface it
  // rather than showing a permanent "waiting" state that will never confirm.
  const notFound =
    bill.error instanceof ApiClientError && bill.error.status === 404

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="mx-auto w-full max-w-xl">
        {!resolvedId ? (
          <Card>
            <CardHeader className="items-center text-center">
              <Loader2Icon className="size-10 animate-spin text-muted-foreground" />
              <CardTitle className="text-xl">Payment processing</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 text-center">
              <p className="text-base text-muted-foreground">
                We could not identify which bill you were paying. Check your bills
                to see the latest status.
              </p>
              <Button asChild size="lg">
                <Link href="/tenant/bills">Go to my bills</Link>
              </Button>
            </CardContent>
          </Card>
        ) : bill.isPending ? (
          <Card>
            <CardHeader className="items-center text-center">
              <Loader2Icon className="size-10 animate-spin text-muted-foreground" />
              <CardTitle className="text-xl">Checking payment status…</CardTitle>
            </CardHeader>
          </Card>
        ) : notFound ? (
          <Card>
            <CardHeader className="items-center text-center">
              <CardTitle className="text-xl">Bill not found</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 text-center">
              <p className="text-base text-muted-foreground">
                We could not find this bill. It may belong to a different account.
                Check your bills for the latest status.
              </p>
              <Button asChild size="lg">
                <Link href="/tenant/bills">Go to my bills</Link>
              </Button>
            </CardContent>
          </Card>
        ) : confirmed ? (
          <Card>
            <CardHeader className="items-center text-center">
              <CheckCircle2Icon className="size-12 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-xl">Payment confirmed</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 text-center">
              <p className="text-base text-muted-foreground">
                Your payment has been confirmed. Thank you!
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild size="lg" variant="outline">
                  <Link href={`/tenant/bills/${resolvedId}`}>View bill</Link>
                </Button>
                <Button asChild size="lg">
                  <Link href="/tenant/payments">Payment history</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="items-center text-center">
              <ClockIcon className="size-12 text-sky-600 dark:text-sky-400" />
              <CardTitle className="text-xl">Waiting for confirmation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 text-center">
              <p className="text-base text-muted-foreground">
                We are waiting for the payment gateway to confirm your payment.
                This can take a few moments. Your bill will update automatically
                once the payment is confirmed — you do not need to pay again.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => bill.refetch()}
                  disabled={bill.isFetching}
                >
                  {bill.isFetching ? (
                    <>
                      <Loader2Icon className="animate-spin" />
                      Checking…
                    </>
                  ) : (
                    "Check again"
                  )}
                </Button>
                <Button asChild size="lg">
                  <Link href={`/tenant/bills/${resolvedId}`}>
                    <ReceiptTextIcon />
                    View bill
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
