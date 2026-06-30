"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/auth-store";

/** App-wide client providers: TanStack Query + toast notifications. */
export function Providers({ children }: { children: React.ReactNode }) {
  // Restore the signed-in role from cookies after a hard refresh.
  useEffect(() => useAuthStore.getState().hydrate(), []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
