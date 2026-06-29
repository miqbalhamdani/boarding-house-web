import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { BASE } from "@/test/msw/handlers";
import { renderWithProviders } from "@/test/utils";
import { getAccessToken } from "@/lib/auth/cookies";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn(), refresh: vi.fn() }),
}));

import OwnerRegisterPage from "./page";

beforeEach(() => replace.mockClear());

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Business name"), "Kos Budi");
  await user.type(screen.getByLabelText("Your full name"), "Owner Name");
  await user.type(screen.getByLabelText("Email"), "owner@example.com");
  await user.type(screen.getByLabelText("Phone number"), "08123456789");
  await user.type(screen.getByLabelText("Password"), "password123");
}

describe("OwnerRegisterPage", () => {
  it("rejects a short password before calling the API", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OwnerRegisterPage />);
    await user.type(screen.getByLabelText("Business name"), "Kos Budi");
    await user.type(screen.getByLabelText("Your full name"), "Owner Name");
    await user.type(screen.getByLabelText("Email"), "owner@example.com");
    await user.type(screen.getByLabelText("Phone number"), "08123456789");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("registers, stores tokens, and redirects", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OwnerRegisterPage />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
    expect(getAccessToken("owner")).toBe("owner-access-1");
  });

  it("shows the conflict message when the email is taken", async () => {
    server.use(
      http.post(`${BASE}/auth/owner/register`, () =>
        HttpResponse.json(
          { error: { code: "CONFLICT", message: "Email already registered" } },
          { status: 409 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<OwnerRegisterPage />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("Email already registered"),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("renders server-side per-field errors inline", async () => {
    server.use(
      http.post(`${BASE}/auth/owner/register`, () =>
        HttpResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Please fix the highlighted fields",
              fields: { email: "Email already in use" },
            },
          },
          { status: 422 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<OwnerRegisterPage />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    const emailField = await screen.findByLabelText("Email");
    expect(await screen.findByText("Email already in use")).toBeInTheDocument();
    expect(emailField).toHaveAttribute("aria-invalid", "true");
  });
});
