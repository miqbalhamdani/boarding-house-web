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

import OwnerLoginPage from "./page";

beforeEach(() => replace.mockClear());

describe("OwnerLoginPage", () => {
  it("shows a validation error for a bad email and does not submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OwnerLoginPage />);
    await user.type(screen.getByLabelText("Email"), "nope");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Enter a valid email address"),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("logs in, stores the token, and redirects to the dashboard", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OwnerLoginPage />);
    await user.type(screen.getByLabelText("Email"), "owner@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
    expect(getAccessToken("owner")).toBe("owner-access-1");
  });

  it("surfaces the API error message on bad credentials", async () => {
    server.use(
      http.post(`${BASE}/auth/owner/login`, () =>
        HttpResponse.json(
          { error: { code: "UNAUTHORIZED", message: "Invalid email or password" } },
          { status: 401 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<OwnerLoginPage />);
    await user.type(screen.getByLabelText("Email"), "owner@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpass");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Invalid email or password"),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
