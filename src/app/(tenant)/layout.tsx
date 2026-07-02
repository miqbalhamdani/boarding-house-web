import Link from "next/link";
import { Building2 } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Tenant portal shell: a simple top bar with branding, theme toggle, and
 * sign-out. Portal pages render their own content below.
 */
export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4 sm:px-6">
        <Link href="/tenant/dashboard" className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <span className="text-lg font-semibold">Tenant portal</span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <LogoutButton role="tenant" />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
