import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { apiFetch } from "@/lib/api/client"
import { ApiClientError } from "@/lib/api/types"

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: `HTTP ${status}`,
    json: async () => body,
  } as Response
}

function clearCookies() {
  for (const name of [
    "owner_access_token",
    "owner_refresh_token",
    "tenant_access_token",
    "tenant_refresh_token",
  ]) {
    document.cookie = `${name}=; Path=/; Max-Age=0`
  }
}

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
  fetchMock.mockReset()
  clearCookies()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("apiFetch", () => {
  it("unwraps the data envelope on success", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { data: { id: "1", name: "Kos" }, message: "ok" })
    )
    const data = await apiFetch<{ id: string; name: string }>("/thing")
    expect(data).toEqual({ id: "1", name: "Kos" })
  })

  it("throws ApiClientError carrying code and fields on error", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid email",
          fields: { email: "already taken" },
        },
      })
    )
    const error: unknown = await apiFetch("/auth/owner/register", {
      body: {},
    }).catch((e) => e)
    expect(error).toBeInstanceOf(ApiClientError)
    const err = error as ApiClientError
    expect(err.status).toBe(400)
    expect(err.code).toBe("VALIDATION_ERROR")
    expect(err.fields.email).toBe("already taken")
  })

  it("attaches the owner Bearer token for owner-kind calls", async () => {
    document.cookie = "owner_access_token=owner-abc; Path=/"
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: {} }))

    await apiFetch("/owner/rooms", { kind: "owner" })

    const [, init] = fetchMock.mock.calls[0]
    const headers = init.headers as Headers
    expect(headers.get("Authorization")).toBe("Bearer owner-abc")
  })

  it("uses the tenant token for tenant-kind calls to /my-room", async () => {
    document.cookie = "tenant_access_token=tenant-xyz; Path=/"
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: {} }))

    await apiFetch("/my-room", { kind: "tenant" })

    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain("/my-room")
    expect((init.headers as Headers).get("Authorization")).toBe(
      "Bearer tenant-xyz"
    )
  })

  it("refreshes once on 401 then retries the original request", async () => {
    document.cookie = "owner_access_token=stale; Path=/"
    document.cookie = "owner_refresh_token=refresh-1; Path=/"

    fetchMock
      // first attempt: unauthorized
      .mockResolvedValueOnce(jsonResponse(401, { error: { code: "UNAUTHORIZED", message: "expired" } }))
      // refresh call: new token pair (flat on data)
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: { access_token: "fresh", refresh_token: "refresh-2" },
        })
      )
      // retry: success
      .mockResolvedValueOnce(jsonResponse(200, { data: { ok: true } }))

    const data = await apiFetch<{ ok: boolean }>("/owner/rooms", {
      kind: "owner",
    })

    expect(data).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    // refresh endpoint was hit
    expect(String(fetchMock.mock.calls[1][0])).toContain("/auth/owner/refresh")
    // retry carried the refreshed token
    expect(
      (fetchMock.mock.calls[2][1].headers as Headers).get("Authorization")
    ).toBe("Bearer fresh")
  })

  it("does not retry when no refresh token is available", async () => {
    document.cookie = "owner_access_token=stale; Path=/"
    fetchMock.mockResolvedValueOnce(
      jsonResponse(401, { error: { code: "UNAUTHORIZED", message: "expired" } })
    )

    await expect(apiFetch("/owner/rooms", { kind: "owner" })).rejects.toThrow(
      ApiClientError
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
