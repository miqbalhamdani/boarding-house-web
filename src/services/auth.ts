import { apiFetch, type ApiResponse } from "@/lib/api/client";
import type { TokenPair } from "@/lib/auth/cookies";
import type {
  OwnerLoginInput,
  OwnerRegisterInput,
  TenantLoginInput,
} from "@/lib/validation/auth";

/** `POST /auth/owner/*` success payload. */
export interface OwnerAuthData {
  tokens: TokenPair;
}

/** `POST /auth/tenant/login` success payload. */
export interface TenantAuthData {
  tenant_id: string;
  tokens: TokenPair;
}

/** `GET /tenant/me` success payload. */
export interface TenantProfile {
  id: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  identity_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status?: string;
}

export async function registerOwner(
  input: OwnerRegisterInput,
): Promise<OwnerAuthData> {
  const res = await apiFetch<ApiResponse<OwnerAuthData>>(
    "/auth/owner/register",
    { method: "POST", body: input, role: "public" },
  );
  return res.data;
}

export async function loginOwner(
  input: OwnerLoginInput,
): Promise<OwnerAuthData> {
  const res = await apiFetch<ApiResponse<OwnerAuthData>>("/auth/owner/login", {
    method: "POST",
    body: input,
    role: "public",
  });
  return res.data;
}

export async function loginTenant(
  input: TenantLoginInput,
): Promise<TenantAuthData> {
  const res = await apiFetch<ApiResponse<TenantAuthData>>(
    "/auth/tenant/login",
    { method: "POST", body: input, role: "public" },
  );
  return res.data;
}

export async function getTenantMe(): Promise<TenantProfile> {
  const res = await apiFetch<ApiResponse<TenantProfile>>("/tenant/me", {
    role: "tenant",
  });
  return res.data;
}
