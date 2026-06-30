import { Badge } from "@/components/ui/badge";
import { ROOM_STATUS_LABELS, type RoomStatus } from "@/lib/validation/rooms";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

const STATUS_VARIANT: Record<RoomStatus, BadgeVariant> = {
  available: "default",
  reserved: "secondary",
  occupied: "outline",
  maintenance: "secondary",
  inactive: "destructive",
};

/** Renders a room status as a coloured badge. Reused in list and detail. */
export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {ROOM_STATUS_LABELS[status]}
    </Badge>
  );
}
