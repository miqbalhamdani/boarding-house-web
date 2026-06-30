import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { BASE } from "@/test/msw/handlers";
import { setAuthCookies } from "@/lib/auth/cookies";
import {
  createRoom,
  listRooms,
  updateRoom,
  deleteRoom,
} from "@/services/rooms";

beforeEach(() => {
  setAuthCookies("owner", {
    access_token: "owner-access-1",
    refresh_token: "owner-refresh-1",
  });
});

describe("rooms service", () => {
  it("sends the owner bearer token and never an owner_id (owner isolation)", async () => {
    let authHeader: string | null = null;
    let body: Record<string, unknown> = {};
    server.use(
      http.post(`${BASE}/owner/rooms`, async ({ request }) => {
        authHeader = request.headers.get("Authorization");
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ data: { id: "room-new" } }, { status: 201 });
      }),
    );

    await createRoom({
      room_number: "201",
      room_name: "Room 201",
      monthly_rent: 1800000,
      status: "available",
      notes: "",
    });

    expect(authHeader).toBe("Bearer owner-access-1");
    expect(body).not.toHaveProperty("owner_id");
  });

  it("builds the list query string from params", async () => {
    let requestUrl = "";
    server.use(
      http.get(`${BASE}/owner/rooms`, ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json(
          { data: { rooms: [], total: 0, page: 2, limit: 20 } },
          { status: 200 },
        );
      }),
    );

    await listRooms({ status: "available", search: "101", page: 2, limit: 20 });

    const url = new URL(requestUrl);
    expect(url.searchParams.get("status")).toBe("available");
    expect(url.searchParams.get("search")).toBe("101");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("limit")).toBe("20");
  });

  it("PATCH and DELETE target the room id with the owner token", async () => {
    let patchAuth: string | null = null;
    let deleteAuth: string | null = null;
    server.use(
      http.patch(`${BASE}/owner/rooms/:id`, ({ request, params }) => {
        patchAuth = request.headers.get("Authorization");
        return HttpResponse.json(
          { data: { id: String(params.id) } },
          { status: 200 },
        );
      }),
      http.delete(`${BASE}/owner/rooms/:id`, ({ request }) => {
        deleteAuth = request.headers.get("Authorization");
        return HttpResponse.json({ message: "ok" }, { status: 200 });
      }),
    );

    await updateRoom("room-1", {
      room_number: "101",
      room_name: "Room 101",
      monthly_rent: 2000000,
      status: "maintenance",
      notes: "",
    });
    await deleteRoom("room-1");

    expect(patchAuth).toBe("Bearer owner-access-1");
    expect(deleteAuth).toBe("Bearer owner-access-1");
  });
});
