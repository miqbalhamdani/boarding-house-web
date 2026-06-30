import { describe, it, expect } from "vitest";
import { safeParseRoomForm, fieldErrors } from "@/lib/validation/rooms";

describe("RoomFormSchema", () => {
  it("accepts a valid room", () => {
    const result = safeParseRoomForm({
      room_number: "101",
      room_name: "Room 101",
      monthly_rent: 2000000,
      status: "available",
      notes: "Near door",
    });
    expect(result.success).toBe(true);
  });

  it("requires room number, name and a positive rent", () => {
    const result = safeParseRoomForm({
      room_number: "",
      room_name: "",
      monthly_rent: undefined,
      status: "available",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.issues);
      expect(errors.room_number).toBeTruthy();
      expect(errors.room_name).toBeTruthy();
      expect(errors.monthly_rent).toBeTruthy();
    }
  });

  it("rejects rent of zero", () => {
    const result = safeParseRoomForm({
      room_number: "101",
      room_name: "Room 101",
      monthly_rent: 0,
      status: "available",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown status", () => {
    const result = safeParseRoomForm({
      room_number: "101",
      room_name: "Room 101",
      monthly_rent: 1000,
      status: "sold",
    });
    expect(result.success).toBe(false);
  });
});
