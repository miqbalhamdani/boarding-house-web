"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Crumb {
  label: string;
  href?: string;
}

/** Map the current owner route to a breadcrumb trail. */
function crumbsFor(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const [section, second, third] = segments;

  if (section === "rooms") {
    const trail: Crumb[] = [{ label: "Rooms", href: "/rooms" }];
    if (!second) {
      trail[0] = { label: "Rooms" };
    } else if (second === "new") {
      trail.push({ label: "New room" });
    } else {
      // [id] detail, optionally /edit
      trail.push(
        third === "edit"
          ? { label: "Room detail", href: `/rooms/${second}` }
          : { label: "Room detail" },
      );
      if (third === "edit") trail.push({ label: "Edit room" });
    }
    return trail;
  }

  if (section === "dashboard") return [{ label: "Dashboard" }];
  return [{ label: section ?? "" }];
}

export function OwnerBreadcrumbs() {
  const pathname = usePathname();
  const crumbs = crumbsFor(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.label}-${i}`}>
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {isLast ? null : <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
