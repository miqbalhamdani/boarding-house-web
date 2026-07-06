"use client"

import * as React from "react"
import { CheckCircle2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useValidatedForm } from "@/hooks/use-form"
import { useRecordManualPayment } from "@/hooks/use-payments"
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABEL,
  recordManualPaymentSchema,
} from "@/lib/payments/schemas"
import { formatIDR } from "@/lib/format"
import type { PaymentMethod } from "@/services/payments"

// Local wall-clock "YYYY-MM-DDTHH:mm" for a datetime-local default, computed on
// the client so the server's timezone is never baked into the markup.
function nowLocalInput(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}`
  )
}

// Records a manual full payment against a specific unpaid bill. The amount is
// pinned to the bill amount (full payment only, BR-019) and shown read-only, so
// a partial amount can never be entered — it rides along as a hidden field. The
// backend enforces the not-already-paid and one-payment-per-bill rules and
// returns a 409 otherwise, surfaced via the mutation's error toast.
export function RecordPaymentDialog({
  billId,
  amount,
  tenantName,
  open,
  onOpenChange,
}: {
  billId: string
  amount: number
  tenantName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [method, setMethod] = React.useState<PaymentMethod | "">("")
  const [paymentDate, setPaymentDate] = React.useState("")
  const [done, setDone] = React.useState(false)

  const record = useRecordManualPayment({ onSuccess: () => setDone(true) })
  const { handleSubmit, fieldError } = useValidatedForm(
    recordManualPaymentSchema,
    record
  )

  // Default the payment date to now in an effect so the value is not baked into
  // SSR markup and mismatched on hydration.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPaymentDate(nowLocalInput())
  }, [])

  function resetForm() {
    setMethod("")
    setPaymentDate(nowLocalInput())
    setDone(false)
  }

  // Block dismissal while the request is in flight; reset when the dialog closes
  // so reopening starts fresh.
  function handleOpenChange(next: boolean) {
    if (record.isPending) return
    if (!next) resetForm()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {done ? (
          <>
            <DialogHeader className="text-left">
              <div className="flex items-center gap-3">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                  aria-hidden
                >
                  <CheckCircle2Icon className="size-6" />
                </span>
                <div>
                  <DialogTitle className="text-2xl">Payment recorded</DialogTitle>
                  <DialogDescription className="text-base">
                    The bill is now marked paid.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <DialogFooter>
              <Button size="lg" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">
                Record manual payment
              </DialogTitle>
              <DialogDescription className="text-base">
                Record a full payment received outside the gateway
                {tenantName ? ` for ${tenantName}` : ""}. Only the full bill
                amount can be recorded.
              </DialogDescription>
            </DialogHeader>

            <input type="hidden" name="bill_id" value={billId} />
            <input type="hidden" name="amount" value={amount} />

            <div className="flex flex-col gap-6 py-6">
              <Field>
                <FieldLabel>Amount</FieldLabel>
                <p className="text-2xl font-bold tabular-nums">
                  {formatIDR(amount)}
                </p>
                <FieldDescription>
                  Equal to the bill amount. Partial payments are not allowed.
                </FieldDescription>
              </Field>

              <Field data-invalid={Boolean(fieldError("payment_method"))}>
                <FieldLabel htmlFor="payment_method">Payment method</FieldLabel>
                <Select
                  value={method}
                  onValueChange={(value) => setMethod(value as PaymentMethod)}
                >
                  <SelectTrigger
                    id="payment_method"
                    className="w-full"
                    aria-invalid={Boolean(fieldError("payment_method"))}
                  >
                    <SelectValue placeholder="Select a method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {PAYMENT_METHOD_LABEL[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Mirror the controlled Select value into the form payload. */}
                <input type="hidden" name="payment_method" value={method} />
                <FieldError>{fieldError("payment_method")}</FieldError>
              </Field>

              <Field data-invalid={Boolean(fieldError("payment_date"))}>
                <FieldLabel htmlFor="payment_date">Payment date</FieldLabel>
                <Input
                  id="payment_date"
                  name="payment_date"
                  type="datetime-local"
                  value={paymentDate}
                  onChange={(event) => setPaymentDate(event.target.value)}
                  aria-invalid={Boolean(fieldError("payment_date"))}
                />
                <FieldDescription>When the payment was received.</FieldDescription>
                <FieldError>{fieldError("payment_date")}</FieldError>
              </Field>

              <Field data-invalid={Boolean(fieldError("reference_number"))}>
                <FieldLabel htmlFor="reference_number">
                  Reference number
                </FieldLabel>
                <Input
                  id="reference_number"
                  name="reference_number"
                  placeholder="e.g. TRX-001"
                  aria-invalid={Boolean(fieldError("reference_number"))}
                />
                <FieldDescription>
                  Optional. Bank or transfer reference.
                </FieldDescription>
                <FieldError>{fieldError("reference_number")}</FieldError>
              </Field>

              <Field data-invalid={Boolean(fieldError("notes"))}>
                <FieldLabel htmlFor="notes">Notes</FieldLabel>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Optional notes about this payment"
                  aria-invalid={Boolean(fieldError("notes"))}
                />
                <FieldError>{fieldError("notes")}</FieldError>
              </Field>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={record.isPending}>
                {record.isPending ? "Recording…" : "Record payment"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
