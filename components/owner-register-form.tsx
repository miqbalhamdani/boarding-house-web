"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuthForm } from "@/hooks/use-auth-form"
import { useOwnerRegister } from "@/hooks/use-auth"
import { ownerRegisterSchema } from "@/lib/auth/schemas"

export function OwnerRegisterForm() {
  const register = useOwnerRegister()
  const { handleSubmit, fieldError } = useAuthForm(ownerRegisterSchema, register)

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your workspace</h1>
          <p className="text-muted-foreground text-base text-balance">
            Register as a property owner
          </p>
        </div>
        <Field data-invalid={Boolean(fieldError("business_name"))}>
          <FieldLabel htmlFor="business_name">Business name</FieldLabel>
          <Input
            id="business_name"
            name="business_name"
            placeholder="Kos Budi"
            aria-invalid={Boolean(fieldError("business_name"))}
          />
          <FieldError>{fieldError("business_name")}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldError("full_name"))}>
          <FieldLabel htmlFor="full_name">Full name</FieldLabel>
          <Input
            id="full_name"
            name="full_name"
            autoComplete="name"
            placeholder="Owner Name"
            aria-invalid={Boolean(fieldError("full_name"))}
          />
          <FieldError>{fieldError("full_name")}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldError("email"))}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="owner@example.com"
            aria-invalid={Boolean(fieldError("email"))}
          />
          <FieldError>{fieldError("email")}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldError("phone_number"))}>
          <FieldLabel htmlFor="phone_number">Phone number</FieldLabel>
          <Input
            id="phone_number"
            name="phone_number"
            type="tel"
            autoComplete="tel"
            placeholder="08123456789"
            aria-invalid={Boolean(fieldError("phone_number"))}
          />
          <FieldError>{fieldError("phone_number")}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldError("password"))}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(fieldError("password"))}
          />
          <FieldError>{fieldError("password")}</FieldError>
        </Field>
        <Field>
          <Button type="submit" disabled={register.isPending}>
            {register.isPending ? "Creating…" : "Create account"}
          </Button>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link href="/owner/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
