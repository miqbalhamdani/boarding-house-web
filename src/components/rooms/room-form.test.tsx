import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { RoomForm } from "./room-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

describe("RoomForm", () => {
  it("blocks submit and shows validation messages when fields are empty", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <RoomForm mode="create" onSubmit={onSubmit} isPending={false} />,
    );

    await user.click(screen.getByRole("button", { name: "Create room" }));

    expect(
      await screen.findByText("Room number is required"),
    ).toBeInTheDocument();
    expect(screen.getByText("Room name is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a valid room (status defaults to available)", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <RoomForm mode="create" onSubmit={onSubmit} isPending={false} />,
    );

    await user.type(screen.getByLabelText("Room number"), "101");
    await user.type(screen.getByLabelText("Room name"), "Room 101");
    await user.type(screen.getByLabelText("Monthly rent (IDR)"), "2000000");
    await user.click(screen.getByRole("button", { name: "Create room" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        room_number: "101",
        room_name: "Room 101",
        monthly_rent: 2000000,
        status: "available",
      }),
    );
  });

  it("disables the submit button while pending", () => {
    renderWithProviders(
      <RoomForm mode="create" onSubmit={vi.fn()} isPending />,
    );
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });
});
