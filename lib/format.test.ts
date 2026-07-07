import { describe, expect, it } from "vitest"

import { formatDateTime, formatIDR } from "@/lib/format"

describe("formatIDR", () => {
  it("formats whole rupiah with id-ID grouping", () => {
    expect(formatIDR(2000000)).toMatch(/Rp\s?2\.000\.000/)
    expect(formatIDR(0)).toMatch(/Rp\s?0/)
  })
})

describe("formatDateTime", () => {
  it("formats an RFC3339 timestamp in the id-ID locale", () => {
    const formatted = formatDateTime("2026-07-10T10:00:00Z")
    expect(formatted).toContain("Juli")
    expect(formatted).toContain("2026")
  })

  it("returns an em dash for an empty value", () => {
    expect(formatDateTime("")).toBe("—")
  })

  it("falls back to the raw string when unparseable", () => {
    expect(formatDateTime("not-a-date")).toBe("not-a-date")
  })
})
