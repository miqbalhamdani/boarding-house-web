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
import { AuthFormField } from "@/components/auth/auth-form-field";
import { useOwnerLogin } from "@/hooks/auth/use-owner-login";
import { apiFieldErrors } from "@/lib/api/errors";
import {
  fieldErrors,
  safeParseOwnerLogin,
} from "@/lib/validation/auth";

export default function OwnerLoginPage() {
  const login = useOwnerLogin();
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Client-side validation takes precedence; fall back to server field errors.
  const serverErrors = apiFieldErrors(login.error);
  const errorFor = (name: string) => errors[name] ?? serverErrors[name];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const input = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    const result = safeParseOwnerLogin(input);
    if (!result.success) {
      setErrors(fieldErrors(result.issues));
      return;
    }
    setErrors({});
    login.mutate(result.output);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Owner sign in</CardTitle>
          <CardDescription>
            Manage your rooms, tenants, and bills.
          </CardDescription>
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
            <AuthFormField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              error={errorFor("email")}
            />
            <AuthFormField
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errorFor("password")}
            />
          </CardContent>
          <CardFooter className="mt-6 flex-col gap-4">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={login.isPending}
            >
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
            <p className="text-sm text-muted-foreground">
              New here?{" "}
              <Link href="/owner/register" className="text-primary underline">
                Create an owner account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
