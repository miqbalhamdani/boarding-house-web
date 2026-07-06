import { describe, expect, it } from "vitest"

import { validate } from "@/lib/forms/validate"
import { assignRoomSchema } from "@/lib/onboarding/schemas"

const validInput = {
  tenant_id: "tenant-1",
  room_id: "room-1",
  start_date: "2026-07-10",
  monthly_rent: "2000000",
  payment_due_day: "10",
}

describe("assignRoomSchema", () => {
  it("accepts a valid payload and coerces numeric fields to integers", () => {
    const result = validate(assignRoomSchema, validInput)
    if (!result.success) throw new Error("expected success")
    expect(result.output.tenant_id).toBe("tenant-1")
    expect(result.output.room_id).toBe("room-1")
    expect(result.output.start_date).toBe("2026-07-10")
    expect(result.output.monthly_rent).toBe(2000000)
    expect(typeof result.output.monthly_rent).toBe("number")
    expect(result.output.payment_due_day).toBe(10)
    expect(typeof result.output.payment_due_day).toBe("number")
  })

  it("requires tenant and room selection", () => {
    const result = validate(assignRoomSchema, {
      ...validInput,
      tenant_id: "",
      room_id: "",
    })
    if (result.success) throw new Error("expected failure")
    expect(result.errors.tenant_id).toBeDefined()
    expect(result.errors.room_id).toBeDefined()
  })

  it.each([
    ["blank", ""],
    ["malformed", "10-07-2026"],
    ["not a date", "not-a-date"],
  ])("rejects a %s start_date", (_label, start_date) => {
    const result = validate(assignRoomSchema, { ...validInput, start_date })
    if (result.success) throw new Error("expected failure")
    expect(result.errors.start_date).toBeDefined()
  })

  it.each([
    ["blank", ""],
    ["non-numeric", "abc"],
    ["zero", "0"],
    ["negative", "-5"],
    ["fractional", "1500.5"],
  ])("rejects a %s monthly_rent", (_label, monthly_rent) => {
    const result = validate(assignRoomSchema, { ...validInput, monthly_rent })
    if (result.success) throw new Error("expected failure")
    expect(result.errors.monthly_rent).toBeDefined()
  })

  it.each([
    ["blank", ""],
    ["non-numeric", "abc"],
    ["zero", "0"],
    ["above 31", "32"],
    ["fractional", "10.5"],
  ])("rejects a %s payment_due_day", (_label, payment_due_day) => {
    const result = validate(assignRoomSchema, { ...validInput, payment_due_day })
    if (result.success) throw new Error("expected failure")
    expect(result.errors.payment_due_day).toBeDefined()
  })

  it.each(["1", "31"])("accepts boundary due day %s", (payment_due_day) => {
    const result = validate(assignRoomSchema, { ...validInput, payment_due_day })
    if (!result.success) throw new Error("expected success")
    expect(result.output.payment_due_day).toBe(Number(payment_due_day))
  })

  it("does not accept an owner_id field into the parsed output", () => {
    const result = validate(assignRoomSchema, {
      ...validInput,
      owner_id: "should-be-ignored",
    })
    if (!result.success) throw new Error("expected success")
    expect("owner_id" in result.output).toBe(false)
  })
})
