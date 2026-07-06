import { describe, expect, it } from "vitest"

import { generateMonthlySchema } from "@/lib/bills/schemas"
import { validate } from "@/lib/forms/validate"

describe("generateMonthlySchema", () => {
  it("accepts a valid YYYY-MM month", () => {
    const result = validate(generateMonthlySchema, { billing_month: "2026-07" })
    if (!result.success) throw new Error("expected success")
    expect(result.output.billing_month).toBe("2026-07")
  })

  it("trims surrounding whitespace", () => {
    const result = validate(generateMonthlySchema, {
      billing_month: "  2026-07  ",
    })
    if (!result.success) throw new Error("expected success")
    expect(result.output.billing_month).toBe("2026-07")
  })

  it("rejects a blank month", () => {
    const result = validate(generateMonthlySchema, { billing_month: "" })
    expect(result.success).toBe(false)
  })

  it("rejects an out-of-range month (13)", () => {
    const result = validate(generateMonthlySchema, { billing_month: "2026-13" })
    expect(result.success).toBe(false)
  })

  it("rejects an unpadded month (2026-7)", () => {
    const result = validate(generateMonthlySchema, { billing_month: "2026-7" })
    expect(result.success).toBe(false)
  })

  it("rejects a full date", () => {
    const result = validate(generateMonthlySchema, {
      billing_month: "2026-07-01",
    })
    expect(result.success).toBe(false)
  })
})
