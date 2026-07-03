import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { OwnerRegisterForm } from "@/components/owner-register-form"
import { useOwnerRegister } from "@/hooks/use-auth"

vi.mock("@/hooks/use-auth", () => ({ useOwnerRegister: vi.fn() }))

const mockUseOwnerRegister = vi.mocked(useOwnerRegister)

type RegisterReturn = ReturnType<typeof useOwnerRegister>

function setup(overrides: Partial<RegisterReturn> = {}) {
  const mutate = vi.fn()
  mockUseOwnerRegister.mockReturnValue({
    mutate,
    isPending: false,
    error: null,
    ...overrides,
  } as RegisterReturn)
  render(<OwnerRegisterForm />)
  return { mutate }
}

function fill(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

describe("OwnerRegisterForm", () => {
  beforeEach(() => {
    mockUseOwnerRegister.mockReset()
  })

  it("blocks submit and surfaces errors when required fields are empty", () => {
    const { mutate } = setup()
    fireEvent.submit(screen.getByRole("button", { name: /create account/i }))
    expect(screen.getByText(/business name is required/i)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it("submits a fully valid registration", () => {
    const { mutate } = setup()
    fill(/business name/i, "Kos Budi")
    fill(/full name/i, "Owner Name")
    fill(/email/i, "owner@example.com")
    fill(/phone number/i, "08123456789")
    fill(/password/i, "password123")
    fireEvent.submit(screen.getByRole("button", { name: /create account/i }))
    expect(mutate).toHaveBeenCalledWith({
      business_name: "Kos Budi",
      full_name: "Owner Name",
      email: "owner@example.com",
      phone_number: "08123456789",
      password: "password123",
    })
  })

  it("disables the submit button while pending", () => {
    setup({ isPending: true })
    expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled()
  })
})
