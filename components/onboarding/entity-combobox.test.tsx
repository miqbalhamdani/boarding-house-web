import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { EntityCombobox } from "@/components/onboarding/entity-combobox"

type Item = { id: string; label: string }

const ITEMS: Item[] = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
]

function renderCombobox(overrides: Partial<React.ComponentProps<typeof EntityCombobox<Item>>> = {}) {
  return render(
    <EntityCombobox<Item>
      name="entity_id"
      selected={null}
      onSelect={vi.fn()}
      items={ITEMS}
      getId={(item) => item.id}
      renderItem={(item) => <span>{item.label}</span>}
      renderSelected={(item) => <span>{item.label}</span>}
      search=""
      onSearchChange={vi.fn()}
      isLoading={false}
      isError={false}
      placeholder="Select one"
      searchPlaceholder="Search…"
      emptyText="Nothing here."
      {...overrides}
    />
  )
}

describe("EntityCombobox", () => {
  it("gives the trigger an id matching its name so a Field label can target it", () => {
    // Regression guard for the a11y fix: <FieldLabel htmlFor="tenant_id"> only
    // works if the combobox trigger carries id="tenant_id".
    renderCombobox()
    const trigger = screen.getByRole("combobox")
    expect(trigger).toHaveAttribute("id", "entity_id")
  })

  it("renders a hidden input under `name` that is empty when nothing is selected", () => {
    const { container } = renderCombobox()
    const hidden = container.querySelector('input[name="entity_id"]')
    expect(hidden).toBeInTheDocument()
    expect(hidden).toHaveValue("")
  })

  it("mirrors the selected id into the hidden input for FormData submission", () => {
    const { container } = renderCombobox({ selected: ITEMS[1] })
    const hidden = container.querySelector('input[name="entity_id"]')
    expect(hidden).toHaveValue("b")
  })

  it("shows the placeholder when nothing is selected", () => {
    renderCombobox()
    expect(screen.getByText("Select one")).toBeInTheDocument()
  })

  it("reflects the invalid state on the trigger for screen readers", () => {
    renderCombobox({ invalid: true })
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true")
  })
})
