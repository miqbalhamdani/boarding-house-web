"use client"

import { useState } from "react"

import { OutstandingBillsCard } from "@/components/dashboard/outstanding-bills-card"
import { RecentPaymentsCard } from "@/components/dashboard/recent-payments-card"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDashboardSummary } from "@/hooks/use-dashboard"
import { errorMessage } from "@/lib/api/errors"

// Current calendar month as YYYY-MM for the default filter value.
function currentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

export function DashboardView() {
  const [month, setMonth] = useState(currentMonth)
  const summary = useDashboardSummary(month)

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-base">
            Overview of your rooms, tenants, bills, and payments
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dashboard-month" className="text-sm">
            Month
          </Label>
          <Input
            id="dashboard-month"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value || currentMonth())}
            className="w-48"
            aria-label="Select summary month"
          />
        </div>
      </div>

      <SummaryCards
        summary={summary.data}
        isPending={summary.isPending}
        isError={summary.isError}
        errorText={summary.isError ? errorMessage(summary.error) : undefined}
        onRetry={() => summary.refetch()}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Bills & recent activity
        </h2>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <OutstandingBillsCard
            title="Unpaid bills"
            status="unpaid"
            emptyText="No unpaid bills. Everything is up to date."
          />
          <OutstandingBillsCard
            title="Overdue bills"
            status="overdue"
            emptyText="No overdue bills."
          />
          <OutstandingBillsCard
            title="Gateway pending"
            status="gateway_pending"
            emptyText="No bills waiting on a gateway payment."
          />
          <RecentPaymentsCard month={month} />
        </div>
      </section>
    </div>
  )
}
