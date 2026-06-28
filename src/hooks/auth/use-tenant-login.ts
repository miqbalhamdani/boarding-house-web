"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginTenant } from "@/services/auth";
import { setAuthCookies } from "@/lib/auth/cookies";
import { useAuthStore } from "@/store/auth-store";
import type { TenantLoginInput } from "@/lib/validation/auth";

/** Tenant login: stores tokens, sets the session, routes to the portal. */
export function useTenantLogin() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (input: TenantLoginInput) => loginTenant(input),
    onSuccess: (data) => {
      setAuthCookies("tenant", data.tokens);
      setSession({ role: "tenant", tenantId: data.tenant_id });
      router.replace("/tenant/dashboard");
    },
  });
}
