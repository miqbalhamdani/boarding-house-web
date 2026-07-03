"use client";

import { BedDouble, Receipt, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DescriptionList,
  DescriptionItem,
} from "@/components/description-list";
import { useTenantMe } from "@/hooks/auth/use-tenant-me";

/** Portal modules that ship after auth; shown as informative placeholders. */
const UPCOMING = [
  {
    title: "My room",
    description: "Your assigned room and move-in details will appear here.",
    icon: BedDouble,
  },
  {
    title: "My bills",
    description: "Monthly bills and their status will appear here.",
    icon: Receipt,
  },
  {
    title: "Payment history",
    description: "Your confirmed payments will appear here.",
    icon: Wallet,
  },
];

/**
 * Minimal tenant portal landing. Confirms the tenant auth flow by loading the
 * authenticated profile from `GET /tenant/me`. Full portal pages (room, bills,
 * payments) come in later modules. Header + sign-out live in the tenant layout.
 */
export default function TenantDashboardPage() {
  const { data, isLoading, isError, error } = useTenantMe();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6 sm:p-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Here are your account details.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My profile</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DescriptionList>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="grid gap-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-48" />
                </div>
              ))}
            </DescriptionList>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load profile</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          ) : (
            <DescriptionList>
              <DescriptionItem term="Name">
                {data?.full_name ?? "—"}
              </DescriptionItem>
              <DescriptionItem term="Email">
                {data?.email ?? "—"}
              </DescriptionItem>
              <DescriptionItem term="Phone">
                {data?.phone_number ?? "—"}
              </DescriptionItem>
            </DescriptionList>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {UPCOMING.map(({ title, description, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="gap-2">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="text-base">
                {description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
