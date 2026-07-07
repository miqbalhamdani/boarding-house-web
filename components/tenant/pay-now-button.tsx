"use client"

import { CreditCardIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { usePayBill } from "@/hooks/use-tenant"
import type { BillStatus } from "@/services/bills"

// Session key so the payment-result page can correlate the gateway redirect back
// to the bill the tenant was paying (the gateway may not echo our bill id).
export const PAY_BILL_SESSION_KEY = "tenant_pay_bill_id"

// A bill is payable only when unpaid, overdue, or gateway_pending (BR-020).
// Paid/cancelled bills disable the button (project frontend rule).
function isPayable(status: BillStatus): boolean {
  return (
    status === "unpaid" || status === "overdue" || status === "gateway_pending"
  )
}

type PayNowButtonProps = {
  billId: string
  status: BillStatus
  className?: string
  size?: "default" | "sm" | "lg"
}

export function PayNowButton({
  billId,
  status,
  className,
  size = "lg",
}: PayNowButtonProps) {
  const payBill = usePayBill({
    onSuccess: (result) => {
      // Never treat the redirect as proof of payment — the result page only
      // reflects backend-confirmed status. We just stash the bill id and hand
      // off to the gateway's hosted checkout.
      try {
        sessionStorage.setItem(PAY_BILL_SESSION_KEY, billId)
      } catch {
        // sessionStorage may be unavailable (private mode) — non-fatal.
      }
      window.location.href = result.checkout_url
    },
  })

  const payable = isPayable(status)

  if (!payable) {
    return (
      <p className="text-base text-muted-foreground">
        {status === "paid"
          ? "This bill is already paid."
          : "This bill was cancelled."}
      </p>
    )
  }

  // A pending gateway checkout may be reused rather than duplicated (BR-021), so
  // label it "Continue payment" for a bill that already has a live checkout.
  const label = status === "gateway_pending" ? "Continue payment" : "Pay Now"

  return (
    <Button
      size={size}
      className={className}
      disabled={payBill.isPending}
      onClick={() => payBill.mutate(billId)}
    >
      {payBill.isPending ? (
        <>
          <Loader2Icon className="animate-spin" />
          Opening checkout…
        </>
      ) : (
        <>
          <CreditCardIcon />
          {label}
        </>
      )}
    </Button>
  )
}
