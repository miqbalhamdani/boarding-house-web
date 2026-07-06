import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { BillStatusBadge } from "@/components/bills/bill-status-badge"
import { BILL_STATUSES, BILL_STATUS_LABEL } from "@/lib/bills/schemas"

describe("BillStatusBadge", () => {
  it.each(BILL_STATUSES)("renders the human label for %s", (status) => {
    render(<BillStatusBadge status={status} />)
    expect(screen.getByText(BILL_STATUS_LABEL[status])).toBeInTheDocument()
  })

  it("renders a decorative dot marked aria-hidden so status is not colour-only", () => {
    const { container } = render(<BillStatusBadge status="overdue" />)
    expect(container.querySelector("[aria-hidden]")).not.toBeNull()
  })
})
