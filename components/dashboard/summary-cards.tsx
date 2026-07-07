"use client"

import {
  AlertTriangle,
  BedDouble,
  Building2,
  CheckCircle2,
  Clock,
  DoorOpen,
  FileText,
  type LucideIcon,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatIDR } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { DashboardSummary } from "@/services/dashboard"

// Accent for the two cards the module asks us to highlight (overdue &
// gateway-pending). Uses the same accessible colour language as the bill/payment
// status badges — soft tint + readable foreground in light and dark mode.
type Accent = "rose" | "sky"

const ACCENT_CARD: Record<Accent, string> = {
  rose: "ring-rose-200 bg-rose-50 dark:ring-rose-500/20 dark:bg-rose-500/10",
  sky: "ring-sky-200 bg-sky-50 dark:ring-sky-500/20 dark:bg-sky-500/10",
}

// Icon chip colour per accent (accent cards) — mirrors the badge foregrounds.
const ACCENT_ICON: Record<Accent, string> = {
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
}

type Metric = {
  key: keyof DashboardSummary
  label: string
  icon: LucideIcon
  money?: boolean
  accent?: Accent
}

type Section = {
  heading: string
  metrics: Metric[]
}

// Grouped so owners scan by theme: the physical property first, then the money
// that flows through it (the module spec highlights overdue & gateway-pending).
const SECTIONS: Section[] = [
  {
    heading: "Occupancy & tenants",
    metrics: [
      { key: "total_rooms", label: "Total rooms", icon: Building2 },
      { key: "available_rooms", label: "Available rooms", icon: DoorOpen },
      { key: "occupied_rooms", label: "Occupied rooms", icon: BedDouble },
      { key: "active_tenants", label: "Active tenants", icon: Users },
    ],
  },
  {
    heading: "Bills & collection",
    metrics: [
      { key: "unpaid_bills", label: "Unpaid bills", icon: FileText },
      {
        key: "overdue_bills",
        label: "Overdue bills",
        icon: TriangleAlert,
        accent: "rose",
      },
      {
        key: "gateway_pending_bills",
        label: "Gateway pending",
        icon: Clock,
        accent: "sky",
      },
      {
        key: "paid_bills_this_month",
        label: "Paid this month",
        icon: CheckCircle2,
      },
      {
        key: "collected_amount_this_month",
        label: "Collected this month",
        icon: Wallet,
        money: true,
      },
    ],
  },
]

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

const SKELETON_COUNT = SECTIONS.reduce((n, s) => n + s.metrics.length, 0)

function MetricCard({
  metric,
  value,
}: {
  metric: Metric
  value: number
}) {
  const Icon = metric.icon
  return (
    <Card
      className={cn(
        "transition-colors motion-reduce:transition-none",
        metric.accent ? ACCENT_CARD[metric.accent] : "hover:bg-muted/40"
      )}
    >
      <CardHeader>
        <CardDescription className="text-base">{metric.label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          {metric.money ? formatIDR(value) : value}
        </CardTitle>
        <CardAction>
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              metric.accent
                ? ACCENT_ICON[metric.accent]
                : "bg-muted text-muted-foreground"
            )}
          >
            <Icon className="size-5" aria-hidden />
          </span>
        </CardAction>
      </CardHeader>
    </Card>
  )
}

export function SummaryCards({
  summary,
  isPending,
  isError,
  errorText,
  onRetry,
}: {
  summary: DashboardSummary | undefined
  isPending: boolean
  isError: boolean
  errorText?: string
  onRetry?: () => void
}) {
  if (isPending) {
    return (
      <div className={GRID}>
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-20" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (isError || !summary) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
        <AlertTriangle className="size-10 text-muted-foreground" />
        <p className="text-base text-muted-foreground">
          {errorText ?? "Could not load the dashboard summary."}
        </p>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {SECTIONS.map((section) => (
        <section key={section.heading} className="flex flex-col gap-3">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {section.heading}
          </h2>
          <div className={GRID}>
            {section.metrics.map((metric) => (
              <MetricCard
                key={metric.key}
                metric={metric}
                value={summary[metric.key]}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
