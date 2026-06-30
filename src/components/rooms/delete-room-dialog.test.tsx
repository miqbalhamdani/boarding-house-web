import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "@/test/utils";
import { server } from "@/test/msw/server";
import { BASE } from "@/test/msw/handlers";
import { setAuthCookies } from "@/lib/auth/cookies";
import { DeleteRoomDialog } from "./delete-room-dialog";

beforeEach(() => {
  setAuthCookies("owner", {
    access_token: "owner-access-1",
    refresh_token: "owner-refresh-1",
  });
});

const availableRoom = {
  id: "room-1",
  room_number: "101",
  status: "available" as const,
};

describe("DeleteRoomDialog", () => {
  it("disables delete for occupied rooms", () => {
    renderWithProviders(
      <DeleteRoomDialog
        room={{ id: "room-2", room_number: "102", status: "occupied" }}
      />,
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("disables delete for reserved rooms", () => {
    renderWithProviders(
      <DeleteRoomDialog
        room={{ id: "room-3", room_number: "103", status: "reserved" }}
      />,
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("confirms and deletes an available room", async () => {
    let deleteCalled = false;
    server.use(
      http.delete(`${BASE}/owner/rooms/:id`, () => {
        deleteCalled = true;
        return HttpResponse.json({ message: "ok" }, { status: 200 });
      }),
    );
    const onDeleted = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <DeleteRoomDialog room={availableRoom} onDeleted={onDeleted} />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(
      await screen.findByRole("button", { name: "Delete room" }),
    );

    await waitFor(() => expect(deleteCalled).toBe(true));
    await waitFor(() => expect(onDeleted).toHaveBeenCalled());
  });
});
