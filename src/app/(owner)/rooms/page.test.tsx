import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "@/test/utils";
import { server } from "@/test/msw/server";
import { BASE } from "@/test/msw/handlers";
import { setAuthCookies } from "@/lib/auth/cookies";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

import RoomsListPage from "./page";

beforeEach(() => {
  setAuthCookies("owner", {
    access_token: "owner-access-1",
    refresh_token: "owner-refresh-1",
  });
});

describe("RoomsListPage", () => {
  it("renders rooms with rent formatted as IDR", async () => {
    renderWithProviders(<RoomsListPage />);

    expect(await screen.findByText("Room 101")).toBeInTheDocument();
    expect(screen.getByText("Room 102")).toBeInTheDocument();
    // 2,000,000 IDR formatted in id-ID locale uses dot separators.
    expect(screen.getByText(/Rp\s?2\.000\.000/)).toBeInTheDocument();
  });

  it("shows an empty state when there are no rooms", async () => {
    server.use(
      http.get(`${BASE}/owner/rooms`, () =>
        HttpResponse.json(
          { data: { rooms: [], total: 0, page: 1, limit: 20 } },
          { status: 200 },
        ),
      ),
    );

    renderWithProviders(<RoomsListPage />);

    expect(
      await screen.findByText(/No rooms found/i),
    ).toBeInTheDocument();
  });

  it("surfaces an error state when the request fails", async () => {
    server.use(
      http.get(`${BASE}/owner/rooms`, () =>
        HttpResponse.json(
          { error: { code: "SERVER_ERROR", message: "Boom" } },
          { status: 500 },
        ),
      ),
    );

    renderWithProviders(<RoomsListPage />);

    await waitFor(() =>
      expect(screen.getByText("Could not load rooms")).toBeInTheDocument(),
    );
  });
});
