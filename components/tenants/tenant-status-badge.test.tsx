import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TenantStatusBadge } from "@/components/tenants/tenant-status-badge"
import { TENANT_STATUSES, TENANT_STATUS_LABEL } from "@/lib/tenants/schemas"

describe("TenantStatusBadge", () => {
  it.each(TENANT_STATUSES)("renders the human label for %s", (status) => {
    render(<TenantStatusBadge status={status} />)
    expect(screen.getByText(TENANT_STATUS_LABEL[status])).toBeInTheDocument()
  })

  it("renders a decorative dot marked aria-hidden so status is not colour-only", () => {
    const { container } = render(<TenantStatusBadge status="active" />)
    expect(container.querySelector("[aria-hidden]")).not.toBeNull()
  })
})
