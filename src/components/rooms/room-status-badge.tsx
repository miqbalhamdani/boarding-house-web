import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { ROOM_STATUS_LABELS, type RoomStatus } from "@/lib/validation/rooms";

/** Maps each room status to a semantic tone (see StatusBadge). */
const STATUS_TONE: Record<RoomStatus, StatusTone> = {
  available: "success",
  reserved: "info",
  occupied: "brand",
  maintenance: "warning",
  inactive: "neutral",
};

/** Renders a room status as a coloured pill. Reused in list and detail. */
export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  return (
    <StatusBadge tone={STATUS_TONE[status]}>
      {ROOM_STATUS_LABELS[status]}
    </StatusBadge>
  );
}
