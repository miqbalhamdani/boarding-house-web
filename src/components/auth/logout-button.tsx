"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/auth/use-logout";
import type { AuthRole } from "@/lib/auth/cookies";

/** Signs the given role out and returns to its login page. */
export function LogoutButton({ role }: { role: AuthRole }) {
  const logout = useLogout(role);
  return (
    <Button variant="outline" size="lg" onClick={logout}>
      Sign out
    </Button>
  );
}
