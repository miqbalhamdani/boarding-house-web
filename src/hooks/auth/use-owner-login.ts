"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginOwner } from "@/services/auth";
import { setAuthCookies } from "@/lib/auth/cookies";
import { useAuthStore } from "@/store/auth-store";
import type { OwnerLoginInput } from "@/lib/validation/auth";

/** Owner login: stores tokens, sets the session, and routes to the dashboard. */
export function useOwnerLogin() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (input: OwnerLoginInput) => loginOwner(input),
    onSuccess: (data) => {
      setAuthCookies("owner", data.tokens);
      setSession({ role: "owner" });
      router.replace("/dashboard");
    },
  });
}
