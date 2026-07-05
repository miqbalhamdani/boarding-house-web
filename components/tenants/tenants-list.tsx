"use client"

import { useEffect, useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import Link from "next/link"
import {
  AlertTriangleIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/general/confirm-dialog"
import { DataPagination } from "@/components/general/data-pagination"
import { TenantFormDialog } from "@/components/tenants/tenant-form"
import { TenantStatusBadge } from "@/components/tenants/tenant-status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDeleteTenant, useTenants } from "@/hooks/use-tenants"
import { errorMessage } from "@/lib/api/errors"
import { TENANT_STATUSES, TENANT_STATUS_LABEL } from "@/lib/tenants/schemas"
import type { Tenant, TenantStatus } from "@/services/tenants"

const PAGE_SIZE = 20
const ALL_STATUSES = "all"

function TenantRowActions({
  tenant,
  onDelete,
}: {
  tenant: Tenant
  onDelete: (tenant: Tenant) => void
}) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground data-[state=open]:bg-muted"
          >
            <EllipsisVerticalIcon />
            <span className="sr-only">Open menu for {tenant.full_name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem asChild>
            <Link href={`/owner/tenants/${tenant.id}`}>View</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              // Keep the menu's close from stealing focus before the dialog opens.
              event.preventDefault()
              setEditOpen(true)
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              // Keep the menu's close from stealing focus before the dialog opens.
              event.preventDefault()
              onDelete(tenant)
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TenantFormDialog
        mode="edit"
        id={tenant.id}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  )
}

function buildColumns(onDelete: (tenant: Tenant) => void): ColumnDef<Tenant>[] {
  return [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          href={`/owner/tenants/${row.original.id}`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {row.original.full_name}
        </Link>
      ),
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.phone_number || "—"}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <TenantStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <TenantRowActions tenant={row.original} onDelete={onDelete} />
      ),
    },
  ]
}

export function TenantsListView() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [status, setStatus] = useState<TenantStatus | "">("")
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null)
  const deleteTenant = useDeleteTenant()

  // Debounce the search box so we don't re-query on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const query = useTenants({
    page,
    limit: PAGE_SIZE,
    status,
    search: debouncedSearch,
  })

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const tenants = query.data?.tenants ?? []

  // Search, filtering and pagination are all handled server-side above, so the
  // table only renders the current page's rows.
  const columns = useMemo(() => buildColumns(setTenantToDelete), [])
  const table = useReactTable({
    data: tenants,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // If the current page falls out of range (e.g. after deleting the last tenant
  // on a page), snap back to the last populated page instead of stranding the
  // user on an empty page with no pagination controls. Adjusting state during
  // render (guarded) is React's recommended pattern for this over an effect.
  if (page > totalPages) {
    setPage(totalPages)
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-muted-foreground text-base">
            Manage the tenants in your workspace
          </p>
        </div>
        <Button size="lg" onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          Add Tenant
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email or phone"
            className="pl-9"
            aria-label="Search tenants"
          />
        </div>
        <Select
          value={status === "" ? ALL_STATUSES : status}
          onValueChange={(value) => {
            setStatus(value === ALL_STATUSES ? "" : (value as TenantStatus))
            setPage(1)
          }}
        >
          <SelectTrigger className="w-48" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
            {TENANT_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {TENANT_STATUS_LABEL[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.isPending ? (
        <div className="overflow-hidden rounded-xl border">
          <div className="flex h-11 items-center gap-4 border-b bg-muted/30 px-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="ml-auto h-4 w-20" />
          </div>
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b px-4 py-3.5 last:border-b-0"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="ml-auto size-8 rounded-md" />
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <AlertTriangleIcon className="size-10 text-muted-foreground" />
          <p className="text-base text-muted-foreground">
            {errorMessage(query.error)}
          </p>
          <Button variant="outline" onClick={() => query.refetch()}>
            Try again
          </Button>
        </div>
      ) : tenants.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <UsersIcon className="size-10 text-muted-foreground" />
          <p className="text-lg font-medium">No tenants found</p>
          <p className="text-base text-muted-foreground">
            {debouncedSearch.trim() || status
              ? "Try adjusting your search or filter."
              : "Add your first tenant to get started."}
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon />
            Add Tenant
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="h-11 text-sm font-semibold text-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="transition-colors hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3.5 text-base">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataPagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
            itemLabel={{ singular: "tenant", plural: "tenants" }}
          />
        </>
      )}

      <TenantFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {/* Single hoisted delete-confirmation dialog for the whole list, driven by
          which row raised a delete request. Stays open (actions disabled) while
          the request is in flight and closes on success; any conflict surfaces
          as a toast via useDeleteTenant. */}
      <ConfirmDialog
        open={tenantToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setTenantToDelete(null)
        }}
        destructive
        title={tenantToDelete ? `Delete ${tenantToDelete.full_name}?` : ""}
        description="This soft-deletes the tenant and removes them from your list."
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        pending={deleteTenant.isPending}
        onConfirm={() => {
          if (!tenantToDelete) return
          deleteTenant.mutate(tenantToDelete.id, {
            onSuccess: () => setTenantToDelete(null),
          })
        }}
      />
    </div>
  )
}
