"use client"

import Link from "next/link"
import { AlertTriangle, Inbox, type LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Icon chip accent so the "needs attention" lists (overdue / gateway) read at a
// glance. Mirrors the accessible tint language used by the status badges.
type Accent = "muted" | "rose" | "sky" | "emerald"

const ICON_STYLE: Record<Accent, string> = {
  muted: "bg-muted text-muted-foreground",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  emerald:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
}

// Shared shell for the four dashboard preview lists. Owns the header (icon +
// title + count badge + "View all" link) and the loading / error / empty states
// so the bill and payment cards only supply their own table markup via `children`.
export function DashboardListCard({
  title,
  icon: Icon,
  accent = "muted",
  count,
  viewAllHref,
  isPending,
  isError,
  isEmpty,
  errorText,
  emptyText,
  onRetry,
  children,
}: {
  title: string
  icon?: LucideIcon
  accent?: Accent
  count?: number
  viewAllHref: string
  isPending: boolean
  isError: boolean
  isEmpty: boolean
  errorText?: string
  emptyText: string
  onRetry?: () => void
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="space-y-0">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            {Icon ? (
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  ICON_STYLE[accent]
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
            ) : null}
            <CardTitle className="text-lg">{title}</CardTitle>
            {typeof count === "number" && count > 0 ? (
              <Badge variant="secondary" className="tabular-nums">
                {count}
              </Badge>
            ) : null}
          </div>
          <Button
            asChild
            variant="link"
            size="sm"
            className="h-auto p-0 text-base"
          >
            <Link href={viewAllHref}>View all</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertTriangle className="size-8 text-muted-foreground" />
            <p className="text-base text-muted-foreground">
              {errorText ?? "Could not load this list."}
            </p>
            {onRetry ? (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Try again
              </Button>
            ) : null}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Inbox className="size-8 text-muted-foreground/70" aria-hidden />
            <p className="text-base text-muted-foreground">{emptyText}</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
