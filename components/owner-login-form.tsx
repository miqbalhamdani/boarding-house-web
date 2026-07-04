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
import { useOwnerLogin } from "@/hooks/use-auth"
import { loginSchema } from "@/lib/auth/schemas"

export function OwnerLoginForm() {
  const login = useOwnerLogin()
  const { handleSubmit, fieldError } = useAuthForm(loginSchema, login)

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Owner login</h1>
          <p className="text-muted-foreground text-base text-balance">
            Sign in to manage your properties
          </p>
        </div>
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
        <Field data-invalid={Boolean(fieldError("password"))}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(fieldError("password"))}
          />
          <FieldError>{fieldError("password")}</FieldError>
        </Field>
        <Field>
          <Button type="submit" disabled={login.isPending}>
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/owner/register"
              className="underline underline-offset-4"
            >
              Register
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
