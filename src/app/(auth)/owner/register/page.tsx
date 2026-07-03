"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormField } from "@/components/form-field";
import { useOwnerRegister } from "@/hooks/auth/use-owner-register";
import { apiFieldErrors } from "@/lib/api/errors";
import { fieldErrors, safeParseOwnerRegister } from "@/lib/validation/auth";

export default function OwnerRegisterPage() {
  const register = useOwnerRegister();
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Client-side validation takes precedence; fall back to server field errors.
  const serverErrors = apiFieldErrors(register.error);
  const errorFor = (name: string) => errors[name] ?? serverErrors[name];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const input = {
      business_name: String(form.get("business_name") ?? ""),
      full_name: String(form.get("full_name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone_number: String(form.get("phone_number") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    const result = safeParseOwnerRegister(input);
    if (!result.success) {
      setErrors(fieldErrors(result.issues));
      return;
    }
    setErrors({});
    register.mutate(result.output);
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create owner account</CardTitle>
        <CardDescription className="text-base">
          Set up your boarding-house workspace.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="grid gap-5">
          {register.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not register</AlertTitle>
              <AlertDescription>
                {(register.error as Error).message}
              </AlertDescription>
            </Alert>
          ) : null}
          <FormField
            id="business_name"
            label="Business name"
            autoComplete="organization"
            error={errorFor("business_name")}
          />
          <FormField
            id="full_name"
            label="Your full name"
            autoComplete="name"
            error={errorFor("full_name")}
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            error={errorFor("email")}
          />
          <FormField
            id="phone_number"
            label="Phone number"
            type="tel"
            autoComplete="tel"
            error={errorFor("phone_number")}
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errorFor("password")}
          />
        </CardContent>
        <CardFooter className="mt-6 flex-col gap-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={register.isPending}
          >
            {register.isPending ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-base text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/owner/login"
              className="font-medium text-primary underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
