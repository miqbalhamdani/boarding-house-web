import { describe, expect, it } from "vitest"

import { recordManualPaymentSchema } from "@/lib/payments/schemas"
import { validate } from "@/lib/forms/validate"

describe("recordManualPaymentSchema", () => {
  const base = {
    bill_id: "b1",
    amount: "2000000",
    payment_method: "bank_transfer",
    payment_date: "",
    reference_number: "",
    notes: "",
  }

  it("accepts a full valid payload and coerces the amount", () => {
    const result = validate(recordManualPaymentSchema, {
      ...base,
      reference_number: "TRX-001",
      notes: "Paid by transfer",
    })
    if (!result.success) throw new Error("expected success")
    expect(result.output.amount).toBe(2000000)
    expect(result.output.bill_id).toBe("b1")
    expect(result.output.payment_method).toBe("bank_transfer")
    expect(result.output.reference_number).toBe("TRX-001")
    expect(result.output.notes).toBe("Paid by transfer")
  })

  it("omits blank optional fields (undefined, not empty string)", () => {
    const result = validate(recordManualPaymentSchema, base)
    if (!result.success) throw new Error("expected success")
    expect(result.output.payment_date).toBeUndefined()
    expect(result.output.reference_number).toBeUndefined()
    expect(result.output.notes).toBeUndefined()
  })

  it("normalises a datetime-local value to an RFC3339 UTC timestamp", () => {
    const result = validate(recordManualPaymentSchema, {
      ...base,
      payment_date: "2026-07-10T10:00",
    })
    if (!result.success) throw new Error("expected success")
    expect(result.output.payment_date).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    )
  })

  it("rejects a missing bill id", () => {
    const result = validate(recordManualPaymentSchema, { ...base, bill_id: "" })
    expect(result.success).toBe(false)
  })

  it("rejects an unknown payment method", () => {
    const result = validate(recordManualPaymentSchema, {
      ...base,
      payment_method: "bitcoin",
    })
    expect(result.success).toBe(false)
  })

  it("rejects a non-positive amount", () => {
    const result = validate(recordManualPaymentSchema, { ...base, amount: "0" })
    expect(result.success).toBe(false)
  })

  it("rejects a fractional amount", () => {
    const result = validate(recordManualPaymentSchema, {
      ...base,
      amount: "2000000.5",
    })
    expect(result.success).toBe(false)
  })
})
