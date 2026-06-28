"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { type AuthRole, clearAuthCookies } from "@/lib/auth/cookies";
import { useAuthStore } from "@/store/auth-store";

/** Clears the session for a role and returns to its login page. */
export function useLogout(role: AuthRole) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);

  return useCallback(() => {
    clearAuthCookies(role);
    clearSession();
    queryClient.clear();
    router.replace(role === "owner" ? "/login" : "/tenant/login");
  }, [role, router, queryClient, clearSession]);
}
