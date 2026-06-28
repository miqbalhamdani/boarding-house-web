import { describe, it, expect, beforeEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { BASE } from "@/test/msw/handlers";
import { apiFetch } from "./client";
import { ApiError } from "./errors";
import {
  getAccessToken,
  setAuthCookies,
} from "@/lib/auth/cookies";

describe("apiFetch", () => {
  beforeEach(() => {
    setAuthCookies("owner", { access_token: "owner-old", refresh_token: "owner-r" });
    setAuthCookies("tenant", { access_token: "tenant-old", refresh_token: "tenant-r" });
  });

  it("attaches the owner bearer token for owner calls (and no owner_id in body)", async () => {
    let seenAuth: string | null = null;
    let seenBody: unknown = null;
    server.use(
      http.post(`${BASE}/owner/ping`, async ({ request }) => {
        seenAuth = request.headers.get("authorization");
        seenBody = await request.json();
        return HttpResponse.json({ data: { ok: true } });
      }),
    );

    await apiFetch("/owner/ping", {
      method: "POST",
      role: "owner",
      body: { foo: "bar" },
    });

    expect(seenAuth).toBe("Bearer owner-old");
    expect(seenBody).toEqual({ foo: "bar" });
    expect(JSON.stringify(seenBody)).not.toContain("owner_id");
  });

  it("attaches the tenant token for tenant calls (not the owner token)", async () => {
    let seenAuth: string | null = null;
    server.use(
      http.get(`${BASE}/tenant/thing`, ({ request }) => {
        seenAuth = request.headers.get("authorization");
        return HttpResponse.json({ data: {} });
      }),
    );
    await apiFetch("/tenant/thing", { role: "tenant" });
    expect(seenAuth).toBe("Bearer tenant-old");
  });

  it("does not attach any token for public calls", async () => {
    let seenAuth: string | null = "x";
    server.use(
      http.post(`${BASE}/auth/owner/login`, ({ request }) => {
        seenAuth = request.headers.get("authorization");
        return HttpResponse.json({ data: { tokens: {} } });
      }),
    );
    await apiFetch("/auth/owner/login", { method: "POST", body: {}, role: "public" });
    expect(seenAuth).toBeNull();
  });

  it("parses the error envelope into an ApiError", async () => {
    server.use(
      http.get(`${BASE}/owner/boom`, () =>
        HttpResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Bad input",
              fields: { email: "required" },
            },
          },
          { status: 400 },
        ),
      ),
    );

    await expect(apiFetch("/owner/boom", { role: "owner" })).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof ApiError &&
        e.status === 400 &&
        e.code === "VALIDATION_ERROR" &&
        e.message === "Bad input" &&
        e.fields.email === "required",
    );
  });

  it("refreshes once on 401 then retries with the new token", async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE}/owner/secure`, ({ request }) => {
        calls += 1;
        if (calls === 1) return new HttpResponse(null, { status: 401 });
        return HttpResponse.json({
          data: { auth: request.headers.get("authorization") },
        });
      }),
      http.post(`${BASE}/auth/owner/refresh`, () =>
        HttpResponse.json({
          data: { access_token: "owner-new", refresh_token: "owner-r2" },
        }),
      ),
    );

    const res = await apiFetch<{ data: { auth: string } }>("/owner/secure", {
      role: "owner",
    });

    expect(calls).toBe(2);
    expect(res.data.auth).toBe("Bearer owner-new");
    expect(getAccessToken("owner")).toBe("owner-new");
  });

  it("refreshes only once for concurrent 401s (single-flight)", async () => {
    let refreshCalls = 0;
    server.use(
      http.get(`${BASE}/owner/secure`, ({ request }) => {
        const auth = request.headers.get("authorization");
        if (auth === "Bearer owner-old") {
          return new HttpResponse(null, { status: 401 });
        }
        return HttpResponse.json({ data: { ok: true } });
      }),
      http.post(`${BASE}/auth/owner/refresh`, () => {
        refreshCalls += 1;
        return HttpResponse.json({
          data: { access_token: "owner-new", refresh_token: "owner-r2" },
        });
      }),
    );

    await Promise.all([
      apiFetch("/owner/secure", { role: "owner" }),
      apiFetch("/owner/secure", { role: "owner" }),
      apiFetch("/owner/secure", { role: "owner" }),
    ]);

    expect(refreshCalls).toBe(1);
    expect(getAccessToken("owner")).toBe("owner-new");
  });

  it("does NOT log out on a transient refresh failure (5xx)", async () => {
    server.use(
      http.get(`${BASE}/owner/secure`, () => new HttpResponse(null, { status: 401 })),
      http.post(`${BASE}/auth/owner/refresh`, () =>
        new HttpResponse(null, { status: 503 }),
      ),
    );

    await expect(apiFetch("/owner/secure", { role: "owner" })).rejects.toBeInstanceOf(
      ApiError,
    );
    // session is preserved so the user can retry
    expect(getAccessToken("owner")).toBe("owner-old");
  });

  it("logs out when the request still 401s after a successful refresh", async () => {
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, assign },
      writable: true,
      configurable: true,
    });
    server.use(
      http.get(`${BASE}/owner/secure`, () => new HttpResponse(null, { status: 401 })),
      http.post(`${BASE}/auth/owner/refresh`, () =>
        HttpResponse.json({
          data: { access_token: "owner-new", refresh_token: "owner-r2" },
        }),
      ),
    );

    await expect(apiFetch("/owner/secure", { role: "owner" })).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(getAccessToken("owner")).toBeUndefined();
    expect(assign).toHaveBeenCalledWith("/login");
  });

  it("clears cookies and redirects when refresh fails", async () => {
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, assign },
      writable: true,
      configurable: true,
    });

    server.use(
      http.get(`${BASE}/owner/secure`, () => new HttpResponse(null, { status: 401 })),
      http.post(`${BASE}/auth/owner/refresh`, () =>
        new HttpResponse(null, { status: 401 }),
      ),
    );

    await expect(apiFetch("/owner/secure", { role: "owner" })).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(getAccessToken("owner")).toBeUndefined();
    expect(assign).toHaveBeenCalledWith("/login");
  });
});
