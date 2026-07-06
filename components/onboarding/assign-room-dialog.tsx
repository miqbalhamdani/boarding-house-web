"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon, CheckCircle2Icon, DoorOpenIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/general/confirm-dialog"
import { RoomStatusBadge } from "@/components/rooms/room-status-badge"
import { TenantStatusBadge } from "@/components/tenants/tenant-status-badge"
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
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useValidatedForm } from "@/hooks/use-form"
import { useAssignRoom, useCancelOnboarding } from "@/hooks/use-onboarding"
import { formatIDR } from "@/lib/format"
import { assignRoomSchema } from "@/lib/onboarding/schemas"
import type { AssignRoomResult } from "@/services/onboarding"
import type { Room } from "@/services/rooms"
import type { Tenant } from "@/services/tenants"

import { RoomCombobox } from "./room-combobox"

// Today's date as YYYY-MM-DD, computed on the client (avoids SSR hydration drift).
function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

function formatDateLong(iso: string): string {
  if (!iso) return "—"
  const parsed = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function SummaryRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <dt className="text-base text-muted-foreground">{label}</dt>
      <dd className="text-base font-medium">{children}</dd>
    </div>
  )
}

// The room + billing fields. The tenant is fixed by the surrounding dialog (we are
// already on that tenant's page), so there is no tenant picker here — the tenant id
// travels via a hidden input in the form.
function AssignRoomFields({
  selectedRoom,
  onRoomSelect,
  monthlyRent,
  onMonthlyRentChange,
  startDate,
  onStartDateChange,
  paymentDueDay,
  onPaymentDueDayChange,
  fieldError,
}: {
  selectedRoom: Room | null
  onRoomSelect: (room: Room | null) => void
  monthlyRent: string
  onMonthlyRentChange: (value: string) => void
  startDate: string
  onStartDateChange: (value: string) => void
  paymentDueDay: string
  onPaymentDueDayChange: (value: string) => void
  fieldError: (name: string) => string | undefined
}) {
  const rentNumber = Number(monthlyRent)
  const rentPreview =
    monthlyRent.trim() !== "" && Number.isInteger(rentNumber) && rentNumber > 0
      ? `= ${formatIDR(rentNumber)} / month`
      : "Enter the rent in whole rupiah (no dots or commas)."

  return (
    <div className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend>Room</FieldLegend>
        <Field data-invalid={Boolean(fieldError("room_id"))}>
          <FieldLabel htmlFor="room_id">Room</FieldLabel>
          <RoomCombobox
            selected={selectedRoom}
            onSelect={onRoomSelect}
            invalid={Boolean(fieldError("room_id"))}
          />
          <FieldDescription>
            Only available rooms can be assigned.
          </FieldDescription>
          <FieldError>{fieldError("room_id")}</FieldError>
        </Field>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend>Billing</FieldLegend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={Boolean(fieldError("start_date"))}>
            <FieldLabel htmlFor="start_date">Start date</FieldLabel>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              value={startDate}
              onChange={(event) => onStartDateChange(event.target.value)}
              aria-invalid={Boolean(fieldError("start_date"))}
            />
            <FieldDescription>The first billing month.</FieldDescription>
            <FieldError>{fieldError("start_date")}</FieldError>
          </Field>

          <Field data-invalid={Boolean(fieldError("payment_due_day"))}>
            <FieldLabel htmlFor="payment_due_day">Payment due day</FieldLabel>
            <Input
              id="payment_due_day"
              name="payment_due_day"
              type="number"
              inputMode="numeric"
              min={1}
              max={31}
              step={1}
              value={paymentDueDay}
              onChange={(event) => onPaymentDueDayChange(event.target.value)}
              placeholder="10"
              aria-invalid={Boolean(fieldError("payment_due_day"))}
            />
            <FieldDescription>Day of the month rent is due (1–31).</FieldDescription>
            <FieldError>{fieldError("payment_due_day")}</FieldError>
          </Field>

          <Field
            className="sm:col-span-2"
            data-invalid={Boolean(fieldError("monthly_rent"))}
          >
            <FieldLabel htmlFor="monthly_rent">Monthly rent</FieldLabel>
            <div className="relative">
              <span
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                Rp
              </span>
              <Input
                id="monthly_rent"
                name="monthly_rent"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                className="pl-10"
                value={monthlyRent}
                onChange={(event) => onMonthlyRentChange(event.target.value)}
                placeholder="2000000"
                aria-invalid={Boolean(fieldError("monthly_rent"))}
              />
            </div>
            <FieldDescription>
              {rentPreview} Prefilled from the room; you can adjust it for this
              tenant.
            </FieldDescription>
            <FieldError>{fieldError("monthly_rent")}</FieldError>
          </Field>
        </div>
      </FieldSet>
    </div>
  )
}

// Onboards the tenant shown on the Tenant Detail page: assigns them to an available
// room, which creates the first rent bill and reserves the room until it is paid.
// The tenant is fixed (passed in), so this asks only for the room + billing terms.
// On success it swaps to an in-dialog summary that also offers to cancel the pending
// onboarding.
export function AssignRoomDialog({
  tenant,
  open,
  onOpenChange,
}: {
  tenant: Tenant
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null)
  const [monthlyRent, setMonthlyRent] = React.useState("")
  const [startDate, setStartDate] = React.useState("")
  const [paymentDueDay, setPaymentDueDay] = React.useState("")
  const [result, setResult] = React.useState<AssignRoomResult | null>(null)
  const [cancelled, setCancelled] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  // Default start date to today and due day to today's day-of-month. In an effect
  // (not a lazy initializer) so the server's timezone date is never baked into the
  // markup and mismatched on hydration near a day boundary.
  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setStartDate(todayIso())
    setPaymentDueDay(String(new Date().getDate()))
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const assign = useAssignRoom({ onSuccess: setResult })
  const cancel = useCancelOnboarding({
    onSuccess: () => {
      setConfirmOpen(false)
      setCancelled(true)
    },
  })
  const { handleSubmit, fieldError } = useValidatedForm(assignRoomSchema, assign)

  function handleRoomSelect(room: Room | null) {
    setSelectedRoom(room)
    // Snapshot the room's current rent as the billing amount (BR-012); editable.
    if (room) setMonthlyRent(String(room.monthly_rent))
  }

  function resetForm() {
    setResult(null)
    setCancelled(false)
    setConfirmOpen(false)
    setSelectedRoom(null)
    setMonthlyRent("")
    setStartDate(todayIso())
    setPaymentDueDay(String(new Date().getDate()))
  }

  // Block dismissal while a mutation is in flight; reset the form when the dialog
  // closes so reopening it starts fresh.
  function handleOpenChange(next: boolean) {
    if (assign.isPending || cancel.isPending) return
    if (!next) resetForm()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 p-0 sm:max-w-2xl">
        {result ? (
          <>
            <DialogHeader className="border-b px-6 py-4 pr-14 text-left">
              <div className="flex items-center gap-3">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                  aria-hidden
                >
                  <CheckCircle2Icon className="size-6" />
                </span>
                <div>
                  <DialogTitle className="text-2xl">
                    {cancelled ? "Onboarding cancelled" : "Tenant assigned"}
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    {cancelled
                      ? "The room is back to available and the first bill was cancelled."
                      : "The first rent bill was created and the room is reserved until it is paid."}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <dl className="divide-y">
                <SummaryRow label="Tenant">{tenant.full_name}</SummaryRow>
                {selectedRoom ? (
                  <SummaryRow label="Room">
                    {selectedRoom.room_number} · {selectedRoom.room_name}
                  </SummaryRow>
                ) : null}
                <SummaryRow label="Monthly rent">
                  {formatIDR(Number(monthlyRent))}
                </SummaryRow>
                <SummaryRow label="Start date">
                  {formatDateLong(startDate)}
                </SummaryRow>
                <SummaryRow label="Payment due day">
                  Day {paymentDueDay} of each month
                </SummaryRow>
              </dl>

              {!cancelled ? (
                <div className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-4">
                  <span className="text-base text-muted-foreground">Status:</span>
                  <RoomStatusBadge status="reserved" />
                  <TenantStatusBadge status="pending_payment" />
                  <span className="text-base text-muted-foreground">
                    First bill created (unpaid)
                  </span>
                </div>
              ) : null}
            </div>

            <DialogFooter className="flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:flex-wrap sm:justify-between">
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                {selectedRoom ? (
                  <Button variant="outline" size="lg" asChild>
                    <Link href={`/owner/rooms/${selectedRoom.id}`}>
                      <DoorOpenIcon />
                      View room
                    </Link>
                  </Button>
                ) : null}
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                {!cancelled ? (
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmOpen(true)}
                  >
                    Cancel onboarding
                  </Button>
                ) : null}
                <Button size="lg" onClick={() => handleOpenChange(false)}>
                  Done
                </Button>
              </div>
            </DialogFooter>

            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={(next) => {
                if (!cancel.isPending) setConfirmOpen(next)
              }}
              title="Cancel this onboarding?"
              description="The room returns to available, the unpaid first bill is cancelled, and the tenant is released. This cannot be undone."
              confirmLabel="Cancel onboarding"
              cancelLabel="Keep it"
              pendingLabel="Cancelling…"
              destructive
              pending={cancel.isPending}
              onConfirm={() => cancel.mutate(result.room_assignment_id)}
            />
          </>
        ) : (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={handleSubmit}
            noValidate
          >
            <DialogHeader className="border-b px-6 py-4 pr-14 text-left">
              <DialogTitle className="text-2xl">Assign a room</DialogTitle>
              <DialogDescription className="text-base">
                Assign {tenant.full_name} to an available room. This creates the
                first rent bill and reserves the room until it is paid.
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <input
                type="hidden"
                name="tenant_id"
                value={tenant.id}
                readOnly
              />
              <AssignRoomFields
                selectedRoom={selectedRoom}
                onRoomSelect={handleRoomSelect}
                monthlyRent={monthlyRent}
                onMonthlyRentChange={setMonthlyRent}
                startDate={startDate}
                onStartDateChange={setStartDate}
                paymentDueDay={paymentDueDay}
                onPaymentDueDayChange={setPaymentDueDay}
                fieldError={fieldError}
              />
            </div>

            <DialogFooter className="gap-3 border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={assign.isPending}>
                {assign.isPending ? "Assigning…" : "Assign room"}
                {assign.isPending ? null : <ArrowRightIcon />}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
