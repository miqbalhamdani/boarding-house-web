import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { getAccessToken } from "@/lib/auth/cookies";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn(), refresh: vi.fn() }),
}));

import TenantLoginPage from "./page";

beforeEach(() => replace.mockClear());

describe("TenantLoginPage", () => {
  it("logs in a tenant and redirects to the portal", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TenantLoginPage />);
    await user.type(screen.getByLabelText("Email"), "tenant@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/tenant/dashboard"),
    );
    // tenant token is stored; owner token is not
    expect(getAccessToken("tenant")).toBe("tenant-access-1");
    expect(getAccessToken("owner")).toBeUndefined();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TenantLoginPage />);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
