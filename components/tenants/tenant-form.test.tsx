import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { TenantFormDialog } from "@/components/tenants/tenant-form"
import { useCreateTenant, useTenant, useUpdateTenant } from "@/hooks/use-tenants"
import { ApiClientError } from "@/lib/api/types"

vi.mock("@/hooks/use-tenants", () => ({
  useCreateTenant: vi.fn(),
  useUpdateTenant: vi.fn(),
  useTenant: vi.fn(),
}))

const mockUseCreateTenant = vi.mocked(useCreateTenant)
const mockUseUpdateTenant = vi.mocked(useUpdateTenant)
const mockUseTenant = vi.mocked(useTenant)

type CreateReturn = ReturnType<typeof useCreateTenant>

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/full name/i), {
    target: { value: "Budi Santoso" },
  })
  fireEvent.change(screen.getByLabelText(/phone number/i), {
    target: { value: "081234567890" },
  })
  fireEvent.change(screen.getByLabelText(/^email$/i), {
    target: { value: "budi@example.com" },
  })
  fireEvent.change(screen.getByLabelText(/identity number/i), {
    target: { value: "317300001" },
  })
  fireEvent.change(screen.getByLabelText(/contact name/i), {
    target: { value: "Siti" },
  })
  fireEvent.change(screen.getByLabelText(/contact phone/i), {
    target: { value: "081299988877" },
  })
}

function setupCreate(overrides: Partial<CreateReturn> = {}) {
  const mutate = vi.fn()
  mockUseCreateTenant.mockReturnValue({
    mutate,
    isPending: false,
    error: null,
    ...overrides,
  } as CreateReturn)
  mockUseUpdateTenant.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  } as unknown as ReturnType<typeof useUpdateTenant>)
  render(<TenantFormDialog mode="create" open onOpenChange={vi.fn()} />)
  return { mutate }
}

describe("TenantFormDialog (create)", () => {
  beforeEach(() => {
    mockUseCreateTenant.mockReset()
    mockUseUpdateTenant.mockReset()
    mockUseTenant.mockReset()
  })

  it("blocks submit and shows validation errors when required fields are empty", () => {
    const { mutate } = setupCreate()
    fireEvent.click(screen.getByRole("button", { name: /create tenant/i }))
    expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it("submits the profile payload with an omitted (undefined) blank password", () => {
    const { mutate } = setupCreate()
    fillRequiredFields()
    fireEvent.click(screen.getByRole("button", { name: /create tenant/i }))
    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: "Budi Santoso",
        phone_number: "081234567890",
        email: "budi@example.com",
        identity_number: "317300001",
        emergency_contact_name: "Siti",
        emergency_contact_phone: "081299988877",
        password: undefined,
      })
    )
  })

  it("rejects a portal password shorter than 6 characters", () => {
    const { mutate } = setupCreate()
    fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/portal password/i), {
      target: { value: "123" },
    })
    fireEvent.click(screen.getByRole("button", { name: /create tenant/i }))
    expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it("disables the submit button while pending", () => {
    setupCreate({ isPending: true })
    expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled()
  })

  it("shows a server field error (e.g. duplicate email)", () => {
    setupCreate({
      error: new ApiClientError(409, "CONFLICT", "Conflict", {
        email: "Email already registered",
      }),
    })
    expect(screen.getByText(/email already registered/i)).toBeInTheDocument()
  })
})
