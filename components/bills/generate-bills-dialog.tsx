"use client"

import * as React from "react"
import { CheckCircle2Icon, FileTextIcon } from "lucide-react"

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
import { useValidatedForm } from "@/hooks/use-form"
import { useGenerateMonthlyBills } from "@/hooks/use-bills"
import { generateMonthlySchema } from "@/lib/bills/schemas"
import type { GenerateMonthlyResult } from "@/services/bills"

// Current month as YYYY-MM, computed on the client (avoids SSR hydration drift
// near a month boundary).
function currentMonthIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${now.getFullYear()}-${month}`
}

// YYYY-MM → "July 2026".
function formatMonthLong(iso: string): string {
  if (!iso) return "—"
  const parsed = new Date(`${iso}-01T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
}

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3">
      <dt className="text-base text-muted-foreground">{label}</dt>
      <dd className="text-base font-medium tabular-nums">{value}</dd>
    </div>
  )
}

// Backup manual "generate monthly bills" action. Owners pick a month; the backend
// creates one unpaid rent bill per active room assignment, skipping any already
// billed for that month (idempotent). On success the dialog swaps to a summary.
export function GenerateBillsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [month, setMonth] = React.useState("")
  const [result, setResult] = React.useState<GenerateMonthlyResult | null>(null)

  // Default the month input to the current month in an effect so the server's
  // timezone month is never baked into the markup and mismatched on hydration.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMonth(currentMonthIso())
  }, [])

  const generate = useGenerateMonthlyBills({ onSuccess: setResult })
  const { handleSubmit, fieldError } = useValidatedForm(
    generateMonthlySchema,
    generate
  )

  function resetForm() {
    setResult(null)
    setMonth(currentMonthIso())
  }

  // Block dismissal while the request is in flight; reset when the dialog closes
  // so reopening starts fresh.
  function handleOpenChange(next: boolean) {
    if (generate.isPending) return
    if (!next) resetForm()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {result ? (
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
                  <DialogTitle className="text-2xl">Bills generated</DialogTitle>
                  <DialogDescription className="text-base">
                    For {formatMonthLong(result.billing_month)}.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <dl className="divide-y">
              <SummaryRow
                label="Active assignments"
                value={result.active_assignments}
              />
              <SummaryRow label="Bills created" value={result.created} />
              <SummaryRow
                label="Skipped (already billed)"
                value={result.skipped}
              />
            </dl>

            <DialogFooter>
              <Button size="lg" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">Generate monthly bills</DialogTitle>
              <DialogDescription className="text-base">
                Creates one unpaid rent bill for every active room assignment in
                the chosen month. Assignments already billed for that month are
                skipped.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <Field data-invalid={Boolean(fieldError("billing_month"))}>
                <FieldLabel htmlFor="billing_month">Billing month</FieldLabel>
                <Input
                  id="billing_month"
                  name="billing_month"
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  aria-invalid={Boolean(fieldError("billing_month"))}
                />
                <FieldDescription>
                  The month to generate rent bills for.
                </FieldDescription>
                <FieldError>{fieldError("billing_month")}</FieldError>
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
              <Button type="submit" size="lg" disabled={generate.isPending}>
                {generate.isPending ? "Generating…" : "Generate bills"}
                {generate.isPending ? null : <FileTextIcon />}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
