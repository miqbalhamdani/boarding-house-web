import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname }));

import { OwnerBreadcrumbs } from "./owner-breadcrumbs";

describe("OwnerBreadcrumbs", () => {
  it("shows a single crumb on the rooms list", () => {
    usePathname.mockReturnValue("/rooms");
    render(<OwnerBreadcrumbs />);
    expect(screen.getByText("Rooms")).toBeInTheDocument();
    expect(screen.queryByText("Room detail")).not.toBeInTheDocument();
  });

  it("builds Rooms / New room on the create page", () => {
    usePathname.mockReturnValue("/rooms/new");
    render(<OwnerBreadcrumbs />);
    expect(screen.getByText("Rooms")).toBeInTheDocument();
    expect(screen.getByText("New room")).toBeInTheDocument();
  });

  it("builds the full trail on the edit page", () => {
    usePathname.mockReturnValue("/rooms/abc-123/edit");
    render(<OwnerBreadcrumbs />);
    expect(screen.getByText("Rooms")).toBeInTheDocument();
    expect(screen.getByText("Room detail")).toBeInTheDocument();
    expect(screen.getByText("Edit room")).toBeInTheDocument();
  });

  it("shows Dashboard on the dashboard route", () => {
    usePathname.mockReturnValue("/dashboard");
    render(<OwnerBreadcrumbs />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
