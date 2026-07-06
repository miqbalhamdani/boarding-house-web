import { Badge } from "@/components/ui/badge"
import { PAYMENT_SOURCE_LABEL } from "@/lib/payments/schemas"
import { cn } from "@/lib/utils"
import type { PaymentSource } from "@/services/payments"

// The app theme is a neutral stone palette with no semantic colors, so we define
// an accessible color map here. Each source pairs a soft background with a
// readable foreground (>=4.5:1) in both light and dark mode, plus a solid dot so
// the source is never conveyed by color alone.
const SOURCE_STYLE: Record<PaymentSource, { badge: string; dot: string }> = {
  manual: {
    badge:
      "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  gateway: {
    badge:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-300",
    dot: "bg-sky-500",
  },
}

export function PaymentSourceBadge({ source }: { source: PaymentSource }) {
  const style = SOURCE_STYLE[source]

  return (
    <Badge
      variant="outline"
      className={cn("h-6 gap-1.5 px-2.5 text-sm font-medium", style.badge)}
    >
      <span
        aria-hidden
        className={cn("size-1.5 shrink-0 rounded-full", style.dot)}
      />
      {PAYMENT_SOURCE_LABEL[source]}
    </Badge>
  )
}
