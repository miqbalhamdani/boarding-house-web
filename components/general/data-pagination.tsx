"use client"

import { cn } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type DataPaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  // Label for the summary line, e.g. { singular: "room", plural: "rooms" }.
  itemLabel?: { singular: string; plural: string }
  className?: string
}

// Page numbers to render, collapsing runs with an ellipsis marker. Always keeps
// the first page, the last page, and the current page ±1.
function pageItems(current: number, total: number): (number | "ellipsis")[] {
  const wanted = new Set<number>([1, total, current - 1, current, current + 1])
  const pages = [...wanted]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)

  const items: (number | "ellipsis")[] = []
  let previous = 0
  for (const page of pages) {
    if (page - previous > 1) items.push("ellipsis")
    items.push(page)
    previous = page
  }
  return items
}

export function DataPagination({
  page,
  pageSize,
  total,
  onPageChange,
  itemLabel = { singular: "item", plural: "items" },
  className,
}: DataPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const label = total === 1 ? itemLabel.singular : itemLabel.plural

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4",
        className
      )}
    >
      <p className="text-base text-muted-foreground">
        Showing {from}–{to} of {total} {label}
      </p>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              text=""
              aria-disabled={page <= 1}
              className={
                page <= 1 ? "pointer-events-none opacity-50" : undefined
              }
              onClick={(event) => {
                event.preventDefault()
                if (page > 1) onPageChange(page - 1)
              }}
            />
          </PaginationItem>
          {pageItems(page, totalPages).map((item, index) =>
            item === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  href="#"
                  isActive={item === page}
                  onClick={(event) => {
                    event.preventDefault()
                    onPageChange(item)
                  }}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              text=""
              aria-disabled={page >= totalPages}
              className={
                page >= totalPages
                  ? "pointer-events-none opacity-50"
                  : undefined
              }
              onClick={(event) => {
                event.preventDefault()
                if (page < totalPages) onPageChange(page + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
