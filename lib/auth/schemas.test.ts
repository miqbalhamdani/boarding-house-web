import { describe, expect, it } from "vitest"

import { loginSchema, ownerRegisterSchema, validate } from "@/lib/auth/schemas"

describe("loginSchema", () => {
  it("accepts a valid email + password", () => {
    const result = validate(loginSchema, {
      email: "owner@example.com",
      password: "password123",
    })
    expect(result.success).toBe(true)
  })

  it("rejects a bad email", () => {
    const result = validate(loginSchema, {
      email: "not-an-email",
      password: "password123",
    })
    expect(result).toMatchObject({ success: false })
    if (!result.success) expect(result.errors.email).toBeDefined()
  })

  it("rejects a short password", () => {
    const result = validate(loginSchema, {
      email: "owner@example.com",
      password: "short",
    })
    if (!result.success) expect(result.errors.password).toBeDefined()
    else throw new Error("expected failure")
  })
})

describe("ownerRegisterSchema", () => {
  const valid = {
    business_name: "Kos Budi",
    full_name: "Owner Name",
    email: "owner@example.com",
    phone_number: "08123456789",
    password: "password123",
  }

  it("accepts a valid payload", () => {
    expect(validate(ownerRegisterSchema, valid).success).toBe(true)
  })

  it("collects errors for every missing required field", () => {
    const result = validate(ownerRegisterSchema, {
      business_name: "",
      full_name: "",
      email: "",
      phone_number: "",
      password: "",
    })
    if (result.success) throw new Error("expected failure")
    expect(Object.keys(result.errors)).toEqual(
      expect.arrayContaining([
        "business_name",
        "full_name",
        "email",
        "phone_number",
        "password",
      ])
    )
  })

  it("rejects an invalid phone number", () => {
    const result = validate(ownerRegisterSchema, { ...valid, phone_number: "abc" })
    if (result.success) throw new Error("expected failure")
    expect(result.errors.phone_number).toBeDefined()
  })

  it("has no owner_id field", () => {
    const result = validate(ownerRegisterSchema, {
      ...valid,
      owner_id: "sneaky",
    })
    // Extra keys are stripped by valibot object schema output.
    if (!result.success) throw new Error("expected success")
    expect("owner_id" in result.output).toBe(false)
  })
})
