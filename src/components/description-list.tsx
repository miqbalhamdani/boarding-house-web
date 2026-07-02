import { cn } from "@/lib/utils";

/**
 * Semantic description list (`<dl>`) for read-only detail views. Pair with
 * {@link DescriptionItem}. Replaces the ad-hoc `<dl>` markup that was repeated
 * across the room detail and tenant portal screens.
 */
export function DescriptionList({
  className,
  ...props
}: React.ComponentProps<"dl">) {
  return <dl className={cn("grid gap-5", className)} {...props} />;
}

/** A single term/description pair. `term` reads large for the elderly audience. */
export function DescriptionItem({
  term,
  children,
}: {
  term: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <dt className="text-sm text-muted-foreground">{term}</dt>
      <dd className="text-lg">{children}</dd>
    </div>
  );
}
