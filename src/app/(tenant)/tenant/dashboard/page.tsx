"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LogoutButton } from "@/components/auth/logout-button";
import { useTenantMe } from "@/hooks/auth/use-tenant-me";

/**
 * Minimal tenant portal landing. Confirms the tenant auth flow by loading the
 * authenticated profile from `GET /tenant/me`. Full portal pages (room, bills,
 * payments) come in later modules.
 */
export default function TenantDashboardPage() {
  const { data, isLoading, isError, error } = useTenantMe();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 p-6 sm:p-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenant portal</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            You are signed in.
          </p>
        </div>
        <LogoutButton role="tenant" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My profile</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading your profile…</p>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load profile</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          ) : (
            <dl className="grid gap-3">
              <div>
                <dt className="text-sm text-muted-foreground">Name</dt>
                <dd className="text-lg">{data?.full_name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="text-lg">{data?.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Phone</dt>
                <dd className="text-lg">{data?.phone_number ?? "—"}</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
