import { Badge } from "@/components/ui/badge"
import { ROOM_STATUS_LABEL } from "@/lib/rooms/schemas"
import { cn } from "@/lib/utils"
import type { RoomStatus } from "@/services/rooms"

// The app theme is a neutral stone palette with no semantic status colors, so
// we define an accessible color map here. Each status pairs a soft background
// with a readable foreground (>=4.5:1) in both light and dark mode, plus a
// solid dot so status is never conveyed by color alone.
const STATUS_STYLE: Record<RoomStatus, { badge: string; dot: string }> = {
  available: {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  reserved: {
    badge:
      "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  occupied: {
    badge:
      "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  maintenance: {
    badge:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  inactive: {
    badge:
      "border-border bg-muted text-muted-foreground dark:bg-muted/60",
    dot: "bg-muted-foreground/60",
  },
}

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const style = STATUS_STYLE[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-1.5 px-2.5 text-sm font-medium",
        style.badge
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 shrink-0 rounded-full", style.dot)}
      />
      {ROOM_STATUS_LABEL[status]}
    </Badge>
  )
}
