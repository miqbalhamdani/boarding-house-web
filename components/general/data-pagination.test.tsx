import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { DataPagination } from "@/components/general/data-pagination"

const label = { singular: "room", plural: "rooms" }

describe("DataPagination", () => {
  it("renders a plural summary for the current window", () => {
    render(
      <DataPagination
        page={1}
        pageSize={20}
        total={45}
        onPageChange={vi.fn()}
        itemLabel={label}
      />
    )
    expect(screen.getByText(/Showing 1–20 of 45 rooms/)).toBeInTheDocument()
  })

  it("uses the singular label when there is exactly one item", () => {
    render(
      <DataPagination
        page={1}
        pageSize={20}
        total={1}
        onPageChange={vi.fn()}
        itemLabel={label}
      />
    )
    expect(screen.getByText(/Showing 1–1 of 1 room$/)).toBeInTheDocument()
  })

  it("caps the summary upper bound and offsets by page", () => {
    render(
      <DataPagination
        page={3}
        pageSize={20}
        total={45}
        onPageChange={vi.fn()}
        itemLabel={label}
      />
    )
    expect(screen.getByText(/Showing 41–45 of 45 rooms/)).toBeInTheDocument()
  })

  it("disables Previous on the first page and Next on the last page", () => {
    const onPageChange = vi.fn()
    const { rerender } = render(
      <DataPagination
        page={1}
        pageSize={20}
        total={45}
        onPageChange={onPageChange}
        itemLabel={label}
      />
    )
    const prev = screen.getByLabelText("Go to previous page")
    expect(prev).toHaveAttribute("aria-disabled", "true")
    fireEvent.click(prev)
    expect(onPageChange).not.toHaveBeenCalled()

    rerender(
      <DataPagination
        page={3}
        pageSize={20}
        total={45}
        onPageChange={onPageChange}
        itemLabel={label}
      />
    )
    const next = screen.getByLabelText("Go to next page")
    expect(next).toHaveAttribute("aria-disabled", "true")
    fireEvent.click(next)
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it("calls onPageChange when clicking a page number, Previous, and Next", () => {
    const onPageChange = vi.fn()
    render(
      <DataPagination
        page={2}
        pageSize={20}
        total={100}
        onPageChange={onPageChange}
        itemLabel={label}
      />
    )
    fireEvent.click(screen.getByRole("link", { name: "1" }))
    expect(onPageChange).toHaveBeenCalledWith(1)

    fireEvent.click(screen.getByLabelText("Go to previous page"))
    expect(onPageChange).toHaveBeenCalledWith(1)

    fireEvent.click(screen.getByLabelText("Go to next page"))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it("collapses long page ranges with an ellipsis", () => {
    render(
      <DataPagination
        page={5}
        pageSize={20}
        total={200}
        onPageChange={vi.fn()}
        itemLabel={label}
      />
    )
    // 10 pages, current 5 → keeps 1, 4, 5, 6, 10 with ellipsis gaps.
    expect(screen.getByRole("link", { name: "1" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "10" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "2" })).not.toBeInTheDocument()
    expect(screen.getAllByText("More pages").length).toBeGreaterThan(0)
  })
})
