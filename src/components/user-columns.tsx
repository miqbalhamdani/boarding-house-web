"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, fromNow } from "@/lib/format";
import type { Role, User } from "@/lib/validation";

const roleVariant: Record<Role, "default" | "secondary" | "outline"> = {
  admin: "default",
  editor: "secondary",
  viewer: "outline",
};

export function buildUserColumns(
  onRemove: (id: string) => void,
): ColumnDef<User>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge
          variant={roleVariant[row.original.role]}
          className="px-3 py-1 text-sm"
        >
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span title={formatDate(row.original.createdAt)}>
          {fromNow(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="destructive"
          onClick={() => onRemove(row.original.id)}
          aria-label={`Remove ${row.original.name}`}
          className="h-11 px-5 text-base"
        >
          Remove
        </Button>
      ),
    },
  ];
}
