import { Building2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Shared shell for the public auth pages (tenant login, owner login/register):
 * a subtle branded backdrop, a centered brand mark, then the page's own Card,
 * with a theme toggle in the corner.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center p-6">
      {/* Flat, token-based backdrop: a soft brand-tinted glow up top. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,var(--color-accent),transparent)]"
      />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Building2 className="size-7" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            Boarding House
          </span>
        </div>
        {children}
      </div>
    </main>
  );
}
