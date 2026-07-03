import Link from "next/link"
import { GalleryVerticalEndIcon } from "lucide-react"

// Two-column auth layout reused from the shadcn starter's login page: brand +
// centered form on the left, muted panel on the right (hidden below `lg`).
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEndIcon className="size-4" />
            </div>
            Second House
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block" />
    </div>
  )
}
