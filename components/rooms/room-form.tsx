"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useValidatedForm } from "@/hooks/use-form"
import { useCreateRoom, useRoom, useUpdateRoom } from "@/hooks/use-rooms"
import { errorMessage } from "@/lib/api/errors"
import { formatIDR } from "@/lib/format"
import {
  ROOM_CREATE_STATUSES,
  ROOM_STATUSES,
  ROOM_STATUS_LABEL,
  roomCreateSchema,
  roomUpdateSchema,
} from "@/lib/rooms/schemas"
import { cn } from "@/lib/utils"
import type { Room, RoomStatus } from "@/services/rooms"

// Mirrors the accessible status palette in room-status-badge.tsx so the select
// options are recognizable at a glance. The dot never carries meaning alone —
// it always sits beside the text label.
const STATUS_DOT: Record<RoomStatus, string> = {
  available: "bg-emerald-500",
  reserved: "bg-violet-500",
  occupied: "bg-blue-500",
  maintenance: "bg-amber-500",
  inactive: "bg-muted-foreground/60",
}

type FieldsProps = {
  room?: Room
  statuses: readonly RoomStatus[]
  fieldError: (name: string) => string | undefined
}

function RoomFields({ room, statuses, fieldError }: FieldsProps) {
  const [rent, setRent] = useState(room ? String(room.monthly_rent) : "")
  const rentNumber = Number(rent)
  const rentPreview =
    rent.trim() !== "" && Number.isInteger(rentNumber) && rentNumber > 0
      ? `= ${formatIDR(rentNumber)} / month`
      : "Enter the rent in whole rupiah (no dots or commas)."

  return (
    <div className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend>Room details</FieldLegend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={Boolean(fieldError("room_number"))}>
            <FieldLabel htmlFor="room_number">Room number</FieldLabel>
            <Input
              id="room_number"
              name="room_number"
              defaultValue={room?.room_number}
              placeholder="101"
              aria-invalid={Boolean(fieldError("room_number"))}
            />
            <FieldDescription>Must be unique in your property.</FieldDescription>
            <FieldError>{fieldError("room_number")}</FieldError>
          </Field>

          <Field data-invalid={Boolean(fieldError("room_name"))}>
            <FieldLabel htmlFor="room_name">Room name</FieldLabel>
            <Input
              id="room_name"
              name="room_name"
              defaultValue={room?.room_name}
              placeholder="Room 101"
              aria-invalid={Boolean(fieldError("room_name"))}
            />
            <FieldDescription>A friendly name to recognize it.</FieldDescription>
            <FieldError>{fieldError("room_name")}</FieldError>
          </Field>
        </div>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend>Pricing &amp; availability</FieldLegend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={Boolean(fieldError("monthly_rent"))}>
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
                defaultValue={room ? room.monthly_rent : ""}
                placeholder="2000000"
                aria-invalid={Boolean(fieldError("monthly_rent"))}
                onChange={(event) => setRent(event.target.value)}
              />
            </div>
            <FieldDescription>{rentPreview}</FieldDescription>
            <FieldError>{fieldError("monthly_rent")}</FieldError>
          </Field>

          <Field data-invalid={Boolean(fieldError("status"))}>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Select name="status" defaultValue={room?.status ?? statuses[0]}>
              <SelectTrigger
                id="status"
                aria-invalid={Boolean(fieldError("status"))}
              >
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((value) => (
                  <SelectItem key={value} value={value}>
                    <span
                      aria-hidden
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        STATUS_DOT[value]
                      )}
                    />
                    {ROOM_STATUS_LABEL[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{fieldError("status")}</FieldError>
          </Field>
        </div>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend>Notes</FieldLegend>
        <Field data-invalid={Boolean(fieldError("notes"))}>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={room?.notes ?? ""}
            placeholder="Optional notes about this room"
            aria-invalid={Boolean(fieldError("notes"))}
          />
          <FieldDescription>
            Optional — anything worth remembering about this room.
          </FieldDescription>
          <FieldError>{fieldError("notes")}</FieldError>
        </Field>
      </FieldSet>
    </div>
  )
}

function FormShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="px-4 py-6 lg:px-6">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base">
            Rooms belong to your workspace only.
          </CardDescription>
        </CardHeader>
        {children}
      </Card>
    </div>
  )
}

// The Cancel + submit pair, shared by the full-page card and the modal. Pass
// `cancelHref` to render Cancel as a navigation link (page) or `onCancel` to
// render it as a button that dismisses the modal.
function RoomFormButtons({
  cancelHref,
  onCancel,
  submitLabel,
  pendingLabel,
  isPending,
}: {
  cancelHref?: string
  onCancel?: () => void
  submitLabel: string
  pendingLabel: string
  isPending: boolean
}) {
  return (
    <>
      {onCancel ? (
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          Cancel
        </Button>
      ) : (
        <Button variant="outline" size="lg" asChild>
          <Link href={cancelHref ?? "/owner/rooms"}>Cancel</Link>
        </Button>
      )}
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </Button>
    </>
  )
}

function FormActions({
  cancelHref,
  submitLabel,
  pendingLabel,
  isPending,
}: {
  cancelHref: string
  submitLabel: string
  pendingLabel: string
  isPending: boolean
}) {
  return (
    <CardFooter className="flex flex-col-reverse gap-3 border-t sm:flex-row sm:justify-end">
      <RoomFormButtons
        cancelHref={cancelHref}
        submitLabel={submitLabel}
        pendingLabel={pendingLabel}
        isPending={isPending}
      />
    </CardFooter>
  )
}

function CreateRoomForm() {
  const create = useCreateRoom()
  const { handleSubmit, fieldError } = useValidatedForm(roomCreateSchema, create)

  return (
    <FormShell title="Add room">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
        <CardContent>
          <RoomFields statuses={ROOM_CREATE_STATUSES} fieldError={fieldError} />
        </CardContent>
        <FormActions
          cancelHref="/owner/rooms"
          submitLabel="Create room"
          pendingLabel="Creating…"
          isPending={create.isPending}
        />
      </form>
    </FormShell>
  )
}

function EditRoomForm({ id }: { id: string }) {
  const room = useRoom(id)
  const update = useUpdateRoom(id)
  const { handleSubmit, fieldError } = useValidatedForm(roomUpdateSchema, update)

  if (room.isPending) {
    return (
      <FormShell title="Edit room">
        <CardContent>
          <div className="flex flex-col gap-8">
            {Array.from({ length: 2 }).map((_, section) => (
              <div key={section} className="flex flex-col gap-4">
                <Skeleton className="h-5 w-40" />
                <div className="grid gap-6 sm:grid-cols-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </FormShell>
    )
  }

  if (room.isError || !room.data) {
    return (
      <FormShell title="Edit room">
        <CardContent>
          <p className="text-base text-muted-foreground">
            {errorMessage(room.error)}
          </p>
        </CardContent>
      </FormShell>
    )
  }

  return (
    <FormShell title="Edit room">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
        <CardContent>
          <RoomFields
            room={room.data}
            statuses={ROOM_STATUSES}
            fieldError={fieldError}
          />
        </CardContent>
        <FormActions
          cancelHref={`/owner/rooms/${id}`}
          submitLabel="Save changes"
          pendingLabel="Saving…"
          isPending={update.isPending}
        />
      </form>
    </FormShell>
  )
}

export function RoomForm({
  mode,
  id,
}: {
  mode: "create" | "edit"
  id?: string
}) {
  if (mode === "edit" && id) return <EditRoomForm id={id} />
  return <CreateRoomForm />
}

function DialogFormLayout({
  title,
  children,
  footer,
}: {
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <>
      <DialogHeader className="border-b px-6 py-4 pr-14 text-left">
        <DialogTitle className="text-2xl">{title}</DialogTitle>
        <DialogDescription className="text-base">
          Rooms belong to your workspace only.
        </DialogDescription>
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>
      {footer}
    </>
  )
}

function CreateDialogBody({ onClose }: { onClose: () => void }) {
  const create = useCreateRoom({ onSuccess: onClose })
  const { handleSubmit, fieldError } = useValidatedForm(roomCreateSchema, create)

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={handleSubmit}
      noValidate
    >
      <DialogFormLayout
        title="Add room"
        footer={
          <DialogFooter className="gap-3 border-t px-6 py-4">
            <RoomFormButtons
              onCancel={onClose}
              submitLabel="Create room"
              pendingLabel="Creating…"
              isPending={create.isPending}
            />
          </DialogFooter>
        }
      >
        <RoomFields statuses={ROOM_CREATE_STATUSES} fieldError={fieldError} />
      </DialogFormLayout>
    </form>
  )
}

function EditDialogBody({
  id,
  onClose,
}: {
  id: string
  onClose: () => void
}) {
  const room = useRoom(id)
  const update = useUpdateRoom(id, { onSuccess: onClose })
  const { handleSubmit, fieldError } = useValidatedForm(roomUpdateSchema, update)

  if (room.isPending) {
    return (
      <DialogFormLayout title="Edit room">
        <div className="flex flex-col gap-8">
          {Array.from({ length: 2 }).map((_, section) => (
            <div key={section} className="flex flex-col gap-4">
              <Skeleton className="h-5 w-40" />
              <div className="grid gap-6 sm:grid-cols-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
          <Skeleton className="h-20 w-full" />
        </div>
      </DialogFormLayout>
    )
  }

  if (room.isError || !room.data) {
    return (
      <DialogFormLayout title="Edit room">
        <p className="text-base text-muted-foreground">
          {errorMessage(room.error)}
        </p>
      </DialogFormLayout>
    )
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={handleSubmit}
      noValidate
    >
      <DialogFormLayout
        title="Edit room"
        footer={
          <DialogFooter className="gap-3 border-t px-6 py-4">
            <RoomFormButtons
              onCancel={onClose}
              submitLabel="Save changes"
              pendingLabel="Saving…"
              isPending={update.isPending}
            />
          </DialogFooter>
        }
      >
        <RoomFields
          room={room.data}
          statuses={ROOM_STATUSES}
          fieldError={fieldError}
        />
      </DialogFormLayout>
    </form>
  )
}

// Controlled modal variant of the room form. The caller owns the open state and
// supplies the trigger. On success the mutation
// calls onClose (via useCreateRoom/useUpdateRoom's onSuccess), so the modal
// closes in place and the invalidated ["rooms"] queries refresh the list/detail.
export function RoomFormDialog({
  mode,
  id,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit"
  id?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const close = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 p-0 sm:max-w-2xl">
        {mode === "edit" && id ? (
          <EditDialogBody id={id} onClose={close} />
        ) : (
          <CreateDialogBody onClose={close} />
        )}
      </DialogContent>
    </Dialog>
  )
}
