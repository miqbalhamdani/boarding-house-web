import { describe, expect, it } from "vitest"

import { validate } from "@/lib/forms/validate"
import { roomCreateSchema, roomUpdateSchema } from "@/lib/rooms/schemas"

const validCreate = {
  room_number: "101",
  room_name: "Room 101",
  monthly_rent: "2000000",
  status: "available",
  notes: "Near front door",
}

describe("roomCreateSchema", () => {
  it("accepts a valid payload and coerces monthly_rent to an integer", () => {
    const result = validate(roomCreateSchema, validCreate)
    if (!result.success) throw new Error("expected success")
    expect(result.output.monthly_rent).toBe(2000000)
    expect(typeof result.output.monthly_rent).toBe("number")
  })

  it("defaults notes to an empty string when omitted", () => {
    const { notes: _notes, ...withoutNotes } = validCreate
    void _notes
    const result = validate(roomCreateSchema, withoutNotes)
    if (!result.success) throw new Error("expected success")
    expect(result.output.notes).toBe("")
  })

  it.each([
    ["blank", ""],
    ["non-numeric", "abc"],
    ["zero", "0"],
    ["negative", "-5"],
    ["fractional", "1500.5"],
  ])("rejects a %s monthly_rent", (_label, monthly_rent) => {
    const result = validate(roomCreateSchema, { ...validCreate, monthly_rent })
    if (result.success) throw new Error("expected failure")
    expect(result.errors.monthly_rent).toBeDefined()
  })

  it("requires room number and name", () => {
    const result = validate(roomCreateSchema, {
      ...validCreate,
      room_number: "",
      room_name: "",
    })
    if (result.success) throw new Error("expected failure")
    expect(result.errors.room_number).toBeDefined()
    expect(result.errors.room_name).toBeDefined()
  })

  it.each(["reserved", "occupied"])(
    "rejects the system-managed status %s on create",
    (status) => {
      const result = validate(roomCreateSchema, { ...validCreate, status })
      if (result.success) throw new Error("expected failure")
      expect(result.errors.status).toBeDefined()
    }
  )

  it("never keeps an owner_id field", () => {
    const result = validate(roomCreateSchema, {
      ...validCreate,
      owner_id: "sneaky",
    })
    if (!result.success) throw new Error("expected success")
    expect("owner_id" in result.output).toBe(false)
  })
})

describe("roomUpdateSchema", () => {
  it("allows the full status set including occupied", () => {
    const result = validate(roomUpdateSchema, {
      ...validCreate,
      status: "occupied",
    })
    expect(result.success).toBe(true)
  })
})
