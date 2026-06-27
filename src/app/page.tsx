import { ThemeToggle } from "@/components/theme-toggle";
import { UserManager } from "@/components/user-manager";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center gap-10 p-6 sm:p-12">
      <div className="flex w-full max-w-3xl items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">my-app</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            A simple, easy-to-read example.
          </p>
        </div>
        <ThemeToggle />
      </div>
      <UserManager />
    </main>
  );
}
