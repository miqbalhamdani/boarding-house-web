import { create } from "zustand"

import {
  clearProfile,
  clearTokens,
  getAccessToken,
  getProfile,
} from "@/lib/auth/tokens"

export type Session = {
  kind: "owner" | "tenant"
  name: string
  email: string | null
} | null

type AuthState = {
  session: Session
  setSession: (session: Session) => void
  // Reads token cookies to restore the session role after a page reload.
  hydrate: () => void
  logout: () => void
}

// Shared client state only: the authoritative auth source is the token cookies
// (read by the API client and middleware). This store mirrors the current role
// so UI can react without re-reading cookies everywhere.
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  hydrate: () => {
    if (getAccessToken("owner")) {
      const p = getProfile("owner")
      set({ session: { kind: "owner", name: p?.name ?? "", email: p?.email ?? null } })
    } else if (getAccessToken("tenant")) {
      const p = getProfile("tenant")
      set({ session: { kind: "tenant", name: p?.name ?? "", email: p?.email ?? null } })
    } else {
      set({ session: null })
    }
  },
  logout: () => {
    clearTokens("owner")
    clearTokens("tenant")
    clearProfile("owner")
    clearProfile("tenant")
    set({ session: null })
  },
}))
