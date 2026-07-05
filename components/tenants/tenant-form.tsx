"use client"

import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

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
import { Skeleton } from "@/components/ui/skeleton"
import { useValidatedForm } from "@/hooks/use-form"
import { useCreateTenant, useTenant, useUpdateTenant } from "@/hooks/use-tenants"
import { errorMessage } from "@/lib/api/errors"
import { tenantCreateSchema, tenantUpdateSchema } from "@/lib/tenants/schemas"
import type { Tenant } from "@/services/tenants"

type FieldsProps = {
  tenant?: Tenant
  // On edit, a portal password already generated is not resent; the field just
  // resets it when filled. The copy adapts to the mode.
  mode: "create" | "edit"
  fieldError: (name: string) => string | undefined
}

function TenantFields({ tenant, mode, fieldError }: FieldsProps) {
  const [showPassword, setShowPassword] = useState(false)
  const passwordHelp =
    mode === "edit"
      ? tenant?.has_portal_access
        ? "Leave blank to keep the current login. Enter a new password (min 6 characters) to reset it."
        : "Optional. Enter a password (min 6 characters) to create tenant portal login."
      : "Optional. Enter a password (min 6 characters) to create tenant portal login now, or leave blank to add it later."

  return (
    <div className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend>Tenant details</FieldLegend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={Boolean(fieldError("full_name"))}>
            <FieldLabel htmlFor="full_name">Full name</FieldLabel>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={tenant?.full_name}
              placeholder="Budi Santoso"
              autoComplete="name"
              aria-invalid={Boolean(fieldError("full_name"))}
            />
            <FieldError>{fieldError("full_name")}</FieldError>
          </Field>

          <Field data-invalid={Boolean(fieldError("phone_number"))}>
            <FieldLabel htmlFor="phone_number">Phone number</FieldLabel>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              inputMode="tel"
              defaultValue={tenant?.phone_number}
              placeholder="081234567890"
              autoComplete="tel"
              aria-invalid={Boolean(fieldError("phone_number"))}
            />
            <FieldError>{fieldError("phone_number")}</FieldError>
          </Field>

          <Field data-invalid={Boolean(fieldError("email"))}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              defaultValue={tenant?.email}
              placeholder="budi@example.com"
              autoComplete="email"
              aria-invalid={Boolean(fieldError("email"))}
            />
            <FieldError>{fieldError("email")}</FieldError>
          </Field>

          <Field data-invalid={Boolean(fieldError("identity_number"))}>
            <FieldLabel htmlFor="identity_number">Identity number</FieldLabel>
            <Input
              id="identity_number"
              name="identity_number"
              defaultValue={tenant?.identity_number}
              placeholder="ID card / KTP number"
              aria-invalid={Boolean(fieldError("identity_number"))}
            />
            <FieldError>{fieldError("identity_number")}</FieldError>
          </Field>
        </div>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend>Emergency contact</FieldLegend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={Boolean(fieldError("emergency_contact_name"))}>
            <FieldLabel htmlFor="emergency_contact_name">
              Contact name
            </FieldLabel>
            <Input
              id="emergency_contact_name"
              name="emergency_contact_name"
              defaultValue={tenant?.emergency_contact_name}
              placeholder="Siti Aminah"
              aria-invalid={Boolean(fieldError("emergency_contact_name"))}
            />
            <FieldError>{fieldError("emergency_contact_name")}</FieldError>
          </Field>

          <Field data-invalid={Boolean(fieldError("emergency_contact_phone"))}>
            <FieldLabel htmlFor="emergency_contact_phone">
              Contact phone
            </FieldLabel>
            <Input
              id="emergency_contact_phone"
              name="emergency_contact_phone"
              type="tel"
              inputMode="tel"
              defaultValue={tenant?.emergency_contact_phone}
              placeholder="081299988877"
              aria-invalid={Boolean(fieldError("emergency_contact_phone"))}
            />
            <FieldError>{fieldError("emergency_contact_phone")}</FieldError>
          </Field>
        </div>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend>Portal access</FieldLegend>
        <Field data-invalid={Boolean(fieldError("password"))}>
          <FieldLabel htmlFor="password">Portal password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="pr-11"
              aria-invalid={Boolean(fieldError("password"))}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-1 size-8 -translate-y-1/2 text-muted-foreground"
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
          <FieldDescription>{passwordHelp}</FieldDescription>
          <FieldError>{fieldError("password")}</FieldError>
        </Field>
      </FieldSet>
    </div>
  )
}

// The Cancel + submit pair for the modal footer. Cancel dismisses the dialog
// via `onCancel`; submit is disabled while the mutation is in flight.
function TenantFormButtons({
  onCancel,
  submitLabel,
  pendingLabel,
  isPending,
}: {
  onCancel: () => void
  submitLabel: string
  pendingLabel: string
  isPending: boolean
}) {
  return (
    <>
      <Button type="button" variant="outline" size="lg" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </Button>
    </>
  )
}

function FormSkeleton() {
  return (
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
      <Skeleton className="h-10 w-full" />
    </div>
  )
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
          Tenants belong to your workspace only.
        </DialogDescription>
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>
      {footer}
    </>
  )
}

function CreateDialogBody({ onClose }: { onClose: () => void }) {
  const create = useCreateTenant({ onSuccess: onClose })
  const { handleSubmit, fieldError } = useValidatedForm(
    tenantCreateSchema,
    create
  )

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={handleSubmit}
      noValidate
    >
      <DialogFormLayout
        title="Add tenant"
        footer={
          <DialogFooter className="gap-3 border-t px-6 py-4">
            <TenantFormButtons
              onCancel={onClose}
              submitLabel="Create tenant"
              pendingLabel="Creating…"
              isPending={create.isPending}
            />
          </DialogFooter>
        }
      >
        <TenantFields mode="create" fieldError={fieldError} />
      </DialogFormLayout>
    </form>
  )
}

function EditDialogBody({ id, onClose }: { id: string; onClose: () => void }) {
  const tenant = useTenant(id)
  const update = useUpdateTenant(id, { onSuccess: onClose })
  const { handleSubmit, fieldError } = useValidatedForm(
    tenantUpdateSchema,
    update
  )

  if (tenant.isPending) {
    return (
      <DialogFormLayout title="Edit tenant">
        <FormSkeleton />
      </DialogFormLayout>
    )
  }

  if (tenant.isError || !tenant.data) {
    return (
      <DialogFormLayout title="Edit tenant">
        <p className="text-base text-muted-foreground">
          {errorMessage(tenant.error)}
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
        title="Edit tenant"
        footer={
          <DialogFooter className="gap-3 border-t px-6 py-4">
            <TenantFormButtons
              onCancel={onClose}
              submitLabel="Save changes"
              pendingLabel="Saving…"
              isPending={update.isPending}
            />
          </DialogFooter>
        }
      >
        <TenantFields tenant={tenant.data} mode="edit" fieldError={fieldError} />
      </DialogFormLayout>
    </form>
  )
}

// Controlled modal variant of the tenant form. The caller owns the open state
// and supplies the trigger. On success the mutation calls onClose (via
// useCreateTenant/useUpdateTenant's onSuccess), so the modal closes in place and
// the invalidated ["tenants"] queries refresh the list/detail.
export function TenantFormDialog({
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
