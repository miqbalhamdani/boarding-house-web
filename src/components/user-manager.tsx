"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { buildUserColumns } from "@/components/user-columns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { safeParseNewUser, type Role } from "@/lib/validation";
import { useUserStore } from "@/store/user-store";

const ROLES: Role[] = ["admin", "editor", "viewer"];

// Shared sizing for large, easy-to-hit controls (≥48px tall).
const fieldClass = "h-12 text-lg px-4";

export function UserManager() {
  const users = useUserStore((s) => s.users);
  const addUser = useUserStore((s) => s.addUser);
  const removeUser = useUserStore((s) => s.removeUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  const [errors, setErrors] = useState<string[]>([]);

  const columns = useMemo(() => buildUserColumns(removeUser), [removeUser]);

  function handleAdd() {
    const result = safeParseNewUser({ name, email, role });
    if (!result.success) {
      setErrors(result.issues.map((i) => i.message));
      return;
    }
    addUser(result.output);
    setName("");
    setEmail("");
    setRole("viewer");
    setErrors([]);
  }

  return (
    <Card className="w-full max-w-3xl gap-8 py-8">
      <CardHeader className="gap-2">
        <CardTitle className="text-2xl">User Manager</CardTitle>
        <CardDescription className="text-base">
          Add a person below, then review them in the list.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-lg font-medium">
              Name
            </label>
            <Input
              id="name"
              className={fieldClass}
              placeholder="e.g. Margaret Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="email" className="text-lg font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              className={fieldClass}
              placeholder="e.g. margaret@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="role" className="text-lg font-medium">
              Role
            </label>
            <select
              id="role"
              className="border-input bg-background h-12 rounded-md border px-4 text-lg focus-visible:ring-3 focus-visible:ring-ring/50"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleAdd} className="h-12 px-6 text-lg">
            Add person
          </Button>
        </div>

        {errors.length > 0 && (
          <ul
            role="alert"
            className="text-destructive space-y-1 text-base font-medium"
          >
            {errors.map((err) => (
              <li key={err}>• {err}</li>
            ))}
          </ul>
        )}

        <DataTable columns={columns} data={users} />
      </CardContent>
    </Card>
  );
}
