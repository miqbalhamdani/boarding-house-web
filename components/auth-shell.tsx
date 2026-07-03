import { HomeIcon } from "lucide-react"

// Centered single-column shell shared by the owner/tenant auth pages.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted p-6 md:p-10">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <HomeIcon className="size-5" />
        </div>
        Second House
      </div>
      <div className="w-full max-w-sm rounded-xl bg-background p-6 shadow-sm md:p-8">
        {children}
      </div>
    </div>
  )
}
