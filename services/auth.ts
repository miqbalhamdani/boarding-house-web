import { apiFetch } from "@/lib/api/client"
import type { TokenPair } from "@/lib/api/types"
import type { LoginInput, OwnerRegisterInput } from "@/lib/auth/schemas"

// Register/login return the account profile alongside the token pair (nested
// under `data`), matching the backend's OwnerAuthResult / TenantAuthResult.
export type OwnerAuthResult = {
  owner_id: string
  owner_user_id: string
  full_name: string
  email: string
  tokens: TokenPair
}

export type TenantAuthResult = {
  tenant_id: string
  owner_id: string
  full_name: string
  tokens: TokenPair
}

export type MyRoom = {
  room_assignment_id: string
  room_id: string
  room_number: string
  // Money is an integer amount in IDR.
  monthly_rent: number
}

export function registerOwner(input: OwnerRegisterInput) {
  return apiFetch<OwnerAuthResult>("/auth/owner/register", {
    method: "POST",
    body: input,
  })
}

export function loginOwner(input: LoginInput) {
  return apiFetch<OwnerAuthResult>("/auth/owner/login", {
    method: "POST",
    body: input,
  })
}

export function loginTenant(input: LoginInput) {
  return apiFetch<TenantAuthResult>("/auth/tenant/login", {
    method: "POST",
    body: input,
  })
}

export function getMyRoom() {
  return apiFetch<MyRoom>("/tenant/my-room", { method: "GET", kind: "tenant" })
}
