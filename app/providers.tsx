"use client"

import { useEffect, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { useAuthStore } from "@/stores/auth-store"

export function Providers({ children }: { children: React.ReactNode }) {
  // Restore the session role from token cookies on first mount so UI that reads
  // the auth store reflects the logged-in state after a full page reload.
  useEffect(() => {
    useAuthStore.getState().hydrate()
  }, [])

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster richColors position="top-center" />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
