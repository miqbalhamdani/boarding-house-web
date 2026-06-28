import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";

/**
 * Minimal owner landing page. The full dashboard belongs to a later module;
 * this confirms the owner auth flow and provides a sign-out action.
 */
export default function OwnerDashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 p-6 sm:p-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Owner dashboard</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            You are signed in.
          </p>
        </div>
        <LogoutButton role="owner" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Rooms, tenants, billing, and payments will appear here as those
            modules are built.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </main>
  );
}
