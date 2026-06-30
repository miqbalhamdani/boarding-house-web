"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, DoorOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/logout-button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/rooms", label: "Rooms", icon: DoorOpen },
] as const;

/**
 * Shared shell for owner pages: a simple nav (Dashboard, Rooms) plus sign-out.
 * Larger text and comfortable spacing for readability. Later owner modules
 * (Tenants, Bills, Payments) add their links here.
 */
export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-b bg-muted/30 p-6 md:w-64 md:border-r md:border-b-0">
        <div>
          <p className="text-xl font-bold tracking-tight">Boarding House</p>
          <p className="text-sm text-muted-foreground">Owner workspace</p>
        </div>
        <nav className="flex flex-row gap-2 md:flex-col">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition-colors",
                isActive(href)
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="md:mt-auto">
          <LogoutButton role="owner" />
        </div>
      </aside>
      <main className="flex-1 p-6 sm:p-10">{children}</main>
    </div>
  );
}
