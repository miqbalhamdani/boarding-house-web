import { apiFetch } from "@/lib/api/client"
import type { TokenPair } from "@/lib/api/types"
import type { LoginInput, OwnerRegisterInput } from "@/lib/auth/schemas"

// Register/login return the token pair nested under `data.tokens`.
type TokensResponse = { tokens: TokenPair }
type TenantLoginResponse = TokensResponse & { tenant_id: string }

export type MyRoom = {
  room_assignment_id: string
  room_id: string
  room_number: string
  // Money is an integer amount in IDR.
  monthly_rent: number
}

export function registerOwner(input: OwnerRegisterInput) {
  return apiFetch<TokensResponse>("/auth/owner/register", {
    method: "POST",
    body: input,
  })
}

export function loginOwner(input: LoginInput) {
  return apiFetch<TokensResponse>("/auth/owner/login", {
    method: "POST",
    body: input,
  })
}

export function loginTenant(input: LoginInput) {
  return apiFetch<TenantLoginResponse>("/auth/login", {
    method: "POST",
    body: input,
  })
}

export function getMyRoom() {
  return apiFetch<MyRoom>("/my-room", { method: "GET", kind: "tenant" })
}
