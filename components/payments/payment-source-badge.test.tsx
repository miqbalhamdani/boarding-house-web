import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PaymentSourceBadge } from "@/components/payments/payment-source-badge"

describe("PaymentSourceBadge", () => {
  it("renders the manual source label", () => {
    render(<PaymentSourceBadge source="manual" />)
    expect(screen.getByText("Manual")).toBeInTheDocument()
  })

  it("renders the gateway source label", () => {
    render(<PaymentSourceBadge source="gateway" />)
    expect(screen.getByText("Gateway")).toBeInTheDocument()
  })
})
