import { cn } from "@/lib/utils";

/**
 * Semantic status pill. Colour + a leading dot + the label together convey
 * meaning, so status is never communicated by colour alone (WCAG). Tones map to
 * the semantic tokens in globals.css and stay ≥4.5:1 in light and dark mode.
 * Shared across modules (rooms today; bills/tenants when those ship).
 */
const TONE_CLASSES = {
  success: "bg-success/12 text-success",
  info: "bg-info/12 text-info",
  warning: "bg-warning/12 text-warning",
  danger: "bg-destructive/12 text-destructive",
  brand: "bg-primary/12 text-primary",
  neutral: "bg-muted text-muted-foreground",
} as const;

export type StatusTone = keyof typeof TONE_CLASSES;

export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
