import { create } from "zustand";
import { type AuthRole, getRole } from "@/lib/auth/cookies";

interface AuthState {
  /** Role currently signed in within this browser, or null. */
  role: AuthRole | null;
  /** Tenant id, available after a tenant login (for the portal UI). */
  tenantId: string | null;
  setSession: (session: { role: AuthRole; tenantId?: string | null }) => void;
  clearSession: () => void;
  /** Re-read the role from cookies (used on app mount / hard refresh). */
  hydrate: () => void;
}

/**
 * Client-only convenience store for the signed-in session. Cookies remain the
 * source of truth (the API client and middleware read them); this just makes
 * the current role/tenant easy to use in components.
 */
export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  tenantId: null,
  setSession: ({ role, tenantId = null }) => set({ role, tenantId }),
  clearSession: () => set({ role: null, tenantId: null }),
  hydrate: () => set({ role: getRole() ?? null }),
}));
