"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Reusable searchable combobox for picking a single entity (tenant, room).
// Filtering is left to the caller (server search for tenants, client filter for
// rooms), so cmdk's own filter is disabled. A hidden input mirrors the selected
// id under `name` so the surrounding uncontrolled <form> / FormData flow — and
// the shared useValidatedForm hook — pick it up with no extra wiring.
export function EntityCombobox<T>({
  name,
  selected,
  onSelect,
  items,
  getId,
  renderItem,
  renderSelected,
  search,
  onSearchChange,
  isLoading,
  isError,
  placeholder,
  searchPlaceholder,
  emptyText,
  invalid = false,
  disabled = false,
}: {
  name: string
  selected: T | null
  onSelect: (item: T | null) => void
  items: T[]
  getId: (item: T) => string
  renderItem: (item: T) => React.ReactNode
  renderSelected: (item: T) => React.ReactNode
  search: string
  onSearchChange: (value: string) => void
  isLoading: boolean
  isError: boolean
  placeholder: string
  searchPlaceholder: string
  emptyText: string
  invalid?: boolean
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const value = selected ? getId(selected) : ""

  return (
    <>
      <input type="hidden" name={name} value={value} readOnly />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={name}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid}
            data-invalid={invalid}
            disabled={disabled}
            className={cn(
              "h-auto min-h-11 w-full justify-between px-3 py-2 text-left text-base font-normal",
              "aria-invalid:border-destructive aria-invalid:ring-destructive/20"
            )}
          >
            {selected ? (
              <span className="min-w-0 flex-1">{renderSelected(selected)}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={onSearchChange}
            />
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading…
                </div>
              ) : isError ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Couldn’t load. Try again.
                </div>
              ) : items.length === 0 ? (
                <CommandEmpty>{emptyText}</CommandEmpty>
              ) : (
                <CommandGroup>
                  {items.map((item) => {
                    const id = getId(item)
                    return (
                      <CommandItem
                        key={id}
                        value={id}
                        onSelect={() => {
                          onSelect(item)
                          onSearchChange("")
                          setOpen(false)
                        }}
                      >
                        <span className="min-w-0 flex-1">{renderItem(item)}</span>
                        <CheckIcon
                          className={cn(
                            "ml-2 size-4 shrink-0",
                            value === id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}
