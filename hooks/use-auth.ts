"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { errorMessage } from "@/lib/api/errors"
import { ApiClientError } from "@/lib/api/types"
import { OWNER_HOME, TENANT_HOME } from "@/lib/auth/guard"
import { setProfile, setOwnerTokens, setTenantTokens } from "@/lib/auth/tokens"
import {
  getMyRoom,
  loginOwner,
  loginTenant,
  registerOwner,
} from "@/services/auth"
import { useAuthStore } from "@/stores/auth-store"

export function useOwnerRegister() {
  const router = useRouter()
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: registerOwner,
    onSuccess: (data) => {
      setOwnerTokens(data.tokens)
      const profile = { name: data.full_name, email: data.email }
      setProfile("owner", profile)
      setSession({ kind: "owner", ...profile })
      toast.success("Account created")
      router.replace(OWNER_HOME)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useOwnerLogin() {
  const router = useRouter()
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: loginOwner,
    onSuccess: (data) => {
      setOwnerTokens(data.tokens)
      const profile = { name: data.full_name, email: data.email }
      setProfile("owner", profile)
      setSession({ kind: "owner", ...profile })
      toast.success("Welcome back")
      router.replace(OWNER_HOME)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useTenantLogin() {
  const router = useRouter()
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: loginTenant,
    onSuccess: (data) => {
      setTenantTokens(data.tokens)
      // Tenant login response carries no email; show the full name only.
      const profile = { name: data.full_name, email: null }
      setProfile("tenant", profile)
      setSession({ kind: "tenant", ...profile })
      toast.success("Welcome back")
      router.replace(TENANT_HOME)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useMyRoom() {
  return useQuery({
    queryKey: ["my-room"],
    queryFn: getMyRoom,
    // Retry only transient failures (network / 5xx) once. Auth (401/403) and
    // not-found (404) errors won't fix themselves on retry.
    retry: (count, error) => {
      const transient =
        !(error instanceof ApiClientError) ||
        error.status === 0 ||
        error.status >= 500
      return transient && count < 1
    },
  })
}
