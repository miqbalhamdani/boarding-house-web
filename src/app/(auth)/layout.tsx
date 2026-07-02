import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Shared shell for the public auth pages (tenant login, owner login/register):
 * a centered card area with a theme toggle in the corner. Individual pages
 * render only their Card.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center p-6">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      {children}
    </main>
  );
}
