import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Owner landing page. Presentational shell for the dashboard module: the stat
 * cards below mirror the metrics in the API summary (see docs/api-spec.md), but
 * live figures are wired up when the dashboard module is built. Values show a
 * placeholder until then.
 */

/** Metrics from `GET /owner/dashboard/summary`, rendered as stat cards. */
const METRICS = [
  { key: "total_rooms", label: "Total rooms" },
  { key: "available_rooms", label: "Available rooms" },
  { key: "occupied_rooms", label: "Occupied rooms" },
  { key: "active_tenants", label: "Active tenants" },
  { key: "unpaid_bills", label: "Unpaid bills" },
  { key: "overdue_bills", label: "Overdue bills" },
  { key: "gateway_pending_bills", label: "Gateway pending" },
  { key: "collected_amount_this_month", label: "Collected this month" },
] as const;

export default function OwnerDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          An overview of your rooms, tenants, bills, and payments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <Card key={metric.key}>
            <CardHeader className="gap-1">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">—</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Unpaid bills, overdue bills, and recent payments will appear here as
            the billing and payment modules are built.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
