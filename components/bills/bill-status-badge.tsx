import { Badge } from "@/components/ui/badge"
import { BILL_STATUS_LABEL } from "@/lib/bills/schemas"
import { cn } from "@/lib/utils"
import type { BillStatus } from "@/services/bills"

// The app theme is a neutral stone palette with no semantic status colors, so
// we define an accessible color map here. Each status pairs a soft background
// with a readable foreground (>=4.5:1) in both light and dark mode, plus a
// solid dot so status is never conveyed by color alone.
const STATUS_STYLE: Record<BillStatus, { badge: string; dot: string }> = {
  unpaid: {
    badge:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  gateway_pending: {
    badge:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  paid: {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  overdue: {
    badge:
      "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300",
    dot: "bg-rose-500",
  },
  cancelled: {
    badge: "border-border bg-muted text-muted-foreground dark:bg-muted/60",
    dot: "bg-muted-foreground/60",
  },
}

export function BillStatusBadge({ status }: { status: BillStatus }) {
  const style = STATUS_STYLE[status]

  return (
    <Badge
      variant="outline"
      className={cn("h-6 gap-1.5 px-2.5 text-sm font-medium", style.badge)}
    >
      <span
        aria-hidden
        className={cn("size-1.5 shrink-0 rounded-full", style.dot)}
      />
      {BILL_STATUS_LABEL[status]}
    </Badge>
  )
}
