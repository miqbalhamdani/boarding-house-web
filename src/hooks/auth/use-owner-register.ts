"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { registerOwner } from "@/services/auth";
import { setAuthCookies } from "@/lib/auth/cookies";
import { useAuthStore } from "@/store/auth-store";
import type { OwnerRegisterInput } from "@/lib/validation/auth";

/**
 * Owner registration. The API auto-logs-in on success (returns a token pair),
 * so we store the tokens and route straight to the dashboard.
 */
export function useOwnerRegister() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (input: OwnerRegisterInput) => registerOwner(input),
    onSuccess: (data) => {
      setAuthCookies("owner", data.tokens);
      setSession({ role: "owner" });
      router.replace("/dashboard");
    },
  });
}
