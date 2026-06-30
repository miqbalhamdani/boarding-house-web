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
];

export { BASE, ownerTokens, tenantTokens };
