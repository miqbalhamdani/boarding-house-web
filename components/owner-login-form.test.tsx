import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { OwnerLoginForm } from "@/components/owner-login-form"
import { useOwnerLogin } from "@/hooks/use-auth"

vi.mock("@/hooks/use-auth", () => ({ useOwnerLogin: vi.fn() }))

const mockUseOwnerLogin = vi.mocked(useOwnerLogin)

type LoginReturn = ReturnType<typeof useOwnerLogin>

function setup(overrides: Partial<LoginReturn> = {}) {
  const mutate = vi.fn()
  mockUseOwnerLogin.mockReturnValue({
    mutate,
    isPending: false,
    error: null,
    ...overrides,
  } as LoginReturn)
  render(<OwnerLoginForm />)
  return { mutate }
}

describe("OwnerLoginForm", () => {
  beforeEach(() => {
    mockUseOwnerLogin.mockReset()
  })

  it("shows validation errors and does not submit when empty", () => {
    const { mutate } = setup()
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }))
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it("submits valid credentials to the mutation", () => {
    const { mutate } = setup()
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "owner@example.com" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    })
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }))
    expect(mutate).toHaveBeenCalledWith({
      email: "owner@example.com",
      password: "password123",
    })
  })

  it("disables the button and shows progress while pending", () => {
    setup({ isPending: true })
    const button = screen.getByRole("button", { name: /signing in/i })
    expect(button).toBeDisabled()
  })
})
