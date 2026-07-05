import { describe, expect, it } from "vitest"

import { validate } from "@/lib/forms/validate"
import { tenantCreateSchema, tenantUpdateSchema } from "@/lib/tenants/schemas"

const validCreate = {
  full_name: "Budi Santoso",
  phone_number: "081234567890",
  email: "budi@example.com",
  identity_number: "317300001",
  emergency_contact_name: "Siti",
  emergency_contact_phone: "081299988877",
  password: "",
}

describe("tenantCreateSchema", () => {
  it("accepts a valid payload", () => {
    const result = validate(tenantCreateSchema, validCreate)
    if (!result.success) throw new Error("expected success")
    expect(result.output.full_name).toBe("Budi Santoso")
  })

  it("omits an empty password from the output", () => {
    const result = validate(tenantCreateSchema, validCreate)
    if (!result.success) throw new Error("expected success")
    expect(result.output.password).toBeUndefined()
  })

  it("keeps a provided password of sufficient length", () => {
    const result = validate(tenantCreateSchema, {
      ...validCreate,
      password: "secret123",
    })
    if (!result.success) throw new Error("expected success")
    expect(result.output.password).toBe("secret123")
  })

  it("rejects a password shorter than 6 characters", () => {
    const result = validate(tenantCreateSchema, {
      ...validCreate,
      password: "123",
    })
    if (result.success) throw new Error("expected failure")
    expect(result.errors.password).toBeDefined()
  })

  it("requires the core profile fields", () => {
    const result = validate(tenantCreateSchema, {
      ...validCreate,
      full_name: "",
      phone_number: "",
      identity_number: "",
    })
    if (result.success) throw new Error("expected failure")
    expect(result.errors.full_name).toBeDefined()
    expect(result.errors.phone_number).toBeDefined()
    expect(result.errors.identity_number).toBeDefined()
  })

  it.each([
    ["blank", ""],
    ["missing @", "budi.example.com"],
    ["missing domain", "budi@"],
  ])("rejects a %s email", (_label, emailValue) => {
    const result = validate(tenantCreateSchema, {
      ...validCreate,
      email: emailValue,
    })
    if (result.success) throw new Error("expected failure")
    expect(result.errors.email).toBeDefined()
  })

  it("requires emergency contact details", () => {
    const result = validate(tenantCreateSchema, {
      ...validCreate,
      emergency_contact_name: "",
      emergency_contact_phone: "",
    })
    if (result.success) throw new Error("expected failure")
    expect(result.errors.emergency_contact_name).toBeDefined()
    expect(result.errors.emergency_contact_phone).toBeDefined()
  })

  it("never keeps an owner_id field", () => {
    const result = validate(tenantCreateSchema, {
      ...validCreate,
      owner_id: "sneaky",
    })
    if (!result.success) throw new Error("expected success")
    expect("owner_id" in result.output).toBe(false)
  })

  it("never keeps a status field", () => {
    const result = validate(tenantCreateSchema, {
      ...validCreate,
      status: "active",
    })
    if (!result.success) throw new Error("expected success")
    expect("status" in result.output).toBe(false)
  })
})

describe("tenantUpdateSchema", () => {
  it("accepts the same valid profile payload", () => {
    const result = validate(tenantUpdateSchema, validCreate)
    expect(result.success).toBe(true)
  })
})
