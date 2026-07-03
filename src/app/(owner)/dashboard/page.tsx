import type { LucideIcon } from "lucide-react";
import {
  DoorOpen,
  DoorClosed,
  BedDouble,
  Users,
  Receipt,
  AlertTriangle,
  Clock,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Owner landing page. Presentational shell for the dashboard module: the stat
 * cards below mirror the metrics in the API summary (see docs/api-spec.md), but
 * live figures are wired up when the dashboard module is built. Values show a
 * placeholder until then.
 */

type Tone = "brand" | "success" | "info" | "warning" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  brand: "bg-primary/12 text-primary",
  success: "bg-success/12 text-success",
  info: "bg-info/12 text-info",
  warning: "bg-warning/12 text-warning",
  danger: "bg-destructive/12 text-destructive",
};

/** Metrics from `GET /owner/dashboard/summary`, rendered as stat cards. */
const METRICS: {
  key: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  tone: Tone;
}[] = [
  { key: "total_rooms", label: "Total rooms", hint: "In your workspace", icon: DoorClosed, tone: "brand" },
  { key: "available_rooms", label: "Available rooms", hint: "Ready to assign", icon: DoorOpen, tone: "success" },
  { key: "occupied_rooms", label: "Occupied rooms", hint: "Currently in use", icon: BedDouble, tone: "brand" },
  { key: "active_tenants", label: "Active tenants", hint: "Paid & moved in", icon: Users, tone: "info" },
  { key: "unpaid_bills", label: "Unpaid bills", hint: "Awaiting payment", icon: Receipt, tone: "warning" },
  { key: "overdue_bills", label: "Overdue bills", hint: "Past the due date", icon: AlertTriangle, tone: "danger" },
  { key: "gateway_pending_bills", label: "Gateway pending", hint: "Payment in progress", icon: Clock, tone: "info" },
  { key: "collected_amount_this_month", label: "Collected this month", hint: "Confirmed payments only", icon: Wallet, tone: "success" },
];

const RECENT_SECTIONS = [
  {
    title: "Unpaid bills",
    description: "Bills awaiting payment will be listed here.",
  },
  {
    title: "Overdue bills",
    description: "Bills past their due date will be flagged here.",
  },
  {
    title: "Recent payments",
    description: "Your latest confirmed payments will appear here.",
  },
];

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
        {METRICS.map(({ key, label, hint, icon: Icon, tone }) => (
          <Card key={key}>
            <CardHeader className="gap-1">
              <div className="flex items-center justify-between gap-2">
                <CardDescription>{label}</CardDescription>
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    TONE_CLASSES[tone],
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
              </div>
              <CardTitle className="text-3xl tabular-nums">—</CardTitle>
              <p className="text-sm text-muted-foreground">{hint}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {RECENT_SECTIONS.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-xl">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed p-4 text-center">
                <p className="text-base text-muted-foreground">
                  {section.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
