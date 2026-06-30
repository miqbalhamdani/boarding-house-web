import { http, HttpResponse } from "msw";

const BASE = "http://localhost:8080/api/v1";

const ownerTokens = {
  access_token: "owner-access-1",
  refresh_token: "owner-refresh-1",
};
const tenantTokens = {
  access_token: "tenant-access-1",
  refresh_token: "tenant-refresh-1",
};

/** Happy-path handlers. Individual tests override these with `server.use()`. */
export const handlers = [
  http.post(`${BASE}/auth/owner/register`, () =>
    HttpResponse.json({ data: { tokens: ownerTokens } }, { status: 201 }),
  ),

  http.post(`${BASE}/auth/owner/login`, () =>
    HttpResponse.json({ data: { tokens: ownerTokens } }, { status: 200 }),
  ),

  http.post(`${BASE}/auth/tenant/login`, () =>
    HttpResponse.json(
      { data: { tenant_id: "tenant-123", tokens: tenantTokens } },
      { status: 200 },
    ),
  ),

  http.post(`${BASE}/auth/owner/refresh`, () =>
    HttpResponse.json({ data: ownerTokens }, { status: 200 }),
  ),

  http.post(`${BASE}/auth/tenant/refresh`, () =>
    HttpResponse.json({ data: tenantTokens }, { status: 200 }),
  ),

  http.get(`${BASE}/tenant/me`, () =>
    HttpResponse.json(
      {
        data: {
          id: "tenant-123",
          full_name: "Budi Santoso",
          email: "tenant@example.com",
          phone_number: "081234567890",
        },
      },
      { status: 200 },
    ),
  ),

  // --- Rooms ---
  http.get(`${BASE}/owner/rooms`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    let rooms = sampleRooms;
    if (status) rooms = rooms.filter((r) => r.status === status);
    return HttpResponse.json(
      { data: { rooms, total: rooms.length, page: 1, limit: 20 } },
      { status: 200 },
    );
  }),

  http.get(`${BASE}/owner/rooms/:id`, ({ params }) =>
    HttpResponse.json(
      { data: { ...sampleRooms[0], id: String(params.id) } },
      { status: 200 },
    ),
  ),

  http.post(`${BASE}/owner/rooms`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { data: { ...sampleRooms[0], id: "room-new", ...body } },
      { status: 201 },
    );
  }),

  http.patch(`${BASE}/owner/rooms/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { data: { ...sampleRooms[0], id: String(params.id), ...body } },
      { status: 200 },
    );
  }),

  http.delete(`${BASE}/owner/rooms/:id`, () =>
    HttpResponse.json({ message: "Room deleted" }, { status: 200 }),
  ),
];

const sampleRooms = [
  {
    id: "room-1",
    room_number: "101",
    room_name: "Room 101",
    monthly_rent: 2000000,
    status: "available",
    notes: "Near front door",
    created_at: "2026-06-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "room-2",
    room_number: "102",
    room_name: "Room 102",
    monthly_rent: 1500000,
    status: "occupied",
    notes: null,
    created_at: "2026-06-02T00:00:00Z",
    updated_at: "2026-06-02T00:00:00Z",
  },
];

export { BASE, ownerTokens, tenantTokens, sampleRooms };
