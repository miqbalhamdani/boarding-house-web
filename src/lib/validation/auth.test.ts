import { describe, it, expect } from "vitest";
import {
  fieldErrors,
  safeParseOwnerLogin,
  safeParseOwnerRegister,
  safeParseTenantLogin,
} from "./auth";

describe("auth validation", () => {
  it("accepts a valid owner login", () => {
    const r = safeParseOwnerLogin({
      email: "owner@example.com",
      password: "password123",
    });
    expect(r.success).toBe(true);
  });

  it("rejects an invalid email and surfaces a field error", () => {
    const r = safeParseOwnerLogin({ email: "nope", password: "x" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(fieldErrors(r.issues).email).toBe("Enter a valid email address");
    }
  });

  it("requires a password", () => {
    const r = safeParseOwnerLogin({ email: "owner@example.com", password: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.issues).password).toBe("Password is required");
  });

  it("enforces an 8-character password on registration", () => {
    const r = safeParseOwnerRegister({
      business_name: "Kos Budi",
      full_name: "Owner Name",
      email: "owner@example.com",
      phone_number: "08123456789",
      password: "short",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(fieldErrors(r.issues).password).toBe(
        "Password must be at least 8 characters",
      );
    }
  });

  it("accepts a complete registration payload", () => {
    const r = safeParseOwnerRegister({
      business_name: "Kos Budi",
      full_name: "Owner Name",
      email: "owner@example.com",
      phone_number: "08123456789",
      password: "password123",
    });
    expect(r.success).toBe(true);
  });

  it("validates tenant login the same way", () => {
    expect(
      safeParseTenantLogin({ email: "t@example.com", password: "pw" }).success,
    ).toBe(true);
    expect(safeParseTenantLogin({ email: "", password: "" }).success).toBe(
      false,
    );
  });

  it("returns an empty map when there are no issues", () => {
    expect(fieldErrors(undefined)).toEqual({});
  });
});
