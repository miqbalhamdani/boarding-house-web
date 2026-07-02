"use client";

import { useState } from "react";
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
import { useTenantLogin } from "@/hooks/auth/use-tenant-login";
import { apiFieldErrors } from "@/lib/api/errors";
import { fieldErrors, safeParseTenantLogin } from "@/lib/validation/auth";

export default function TenantLoginPage() {
  const login = useTenantLogin();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const serverErrors = apiFieldErrors(login.error);
  const errorFor = (name: string) => errors[name] ?? serverErrors[name];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const input = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    const result = safeParseTenantLogin(input);
    if (!result.success) {
      setErrors(fieldErrors(result.issues));
      return;
    }
    setErrors({});
    login.mutate(result.output);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Tenant sign in</CardTitle>
        <CardDescription>View your room, bills, and payments.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="grid gap-5">
          {login.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not sign in</AlertTitle>
              <AlertDescription>
                {(login.error as Error).message}
              </AlertDescription>
            </Alert>
          ) : null}
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            error={errorFor("email")}
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errorFor("password")}
          />
        </CardContent>
        <CardFooter className="mt-6">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={login.isPending}
          >
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
