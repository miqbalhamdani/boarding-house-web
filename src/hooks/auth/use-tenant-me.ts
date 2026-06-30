"use client";

import { useQuery } from "@tanstack/react-query";
import { getTenantMe } from "@/services/auth";

export const tenantMeKey = ["tenant", "me"] as const;

/** Fetch the authenticated tenant's profile (`GET /tenant/me`). */
export function useTenantMe() {
  return useQuery({
    queryKey: tenantMeKey,
    queryFn: getTenantMe,
  });
}
