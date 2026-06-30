import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Minimal owner landing page. The full dashboard belongs to a later module;
 * this confirms the owner auth flow. Navigation and sign-out live in the
 * shared owner layout.
 */
export default function OwnerDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Owner dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">You are signed in.</p>
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
    </div>
  );
}
