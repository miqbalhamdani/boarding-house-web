"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthFormField } from "@/components/auth/auth-form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFieldErrors } from "@/lib/api/errors";
import {
  ROOM_STATUSES,
  ROOM_STATUS_LABELS,
  fieldErrors,
  safeParseRoomForm,
  type RoomFormInput,
  type RoomStatus,
} from "@/lib/validation/rooms";

export interface RoomFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<RoomFormInput>;
  onSubmit: (input: RoomFormInput) => void;
  isPending: boolean;
  /** Mutation error, used for server-side field + general messages. */
  error?: unknown;
}

/**
 * Shared create/edit room form. Native FormData + Valibot validation (same
 * pattern as the auth forms); status is a controlled Select. Client-side
 * validation takes precedence, falling back to server field errors.
 */
export function RoomForm({
  mode,
  defaultValues,
  onSubmit,
  isPending,
  error,
}: RoomFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<RoomStatus>(
    defaultValues?.status ?? "available",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const serverErrors = apiFieldErrors(error);
  const errorFor = (name: string) => errors[name] ?? serverErrors[name];
  const hasGeneralError = Boolean(error);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const rentRaw = String(form.get("monthly_rent") ?? "").trim();
    const input = {
      room_number: String(form.get("room_number") ?? ""),
      room_name: String(form.get("room_name") ?? ""),
      // Empty stays NaN-free; valibot reports "required" for non-numbers.
      monthly_rent: rentRaw === "" ? undefined : Number(rentRaw),
      status,
      notes: String(form.get("notes") ?? ""),
    };
    const result = safeParseRoomForm(input);
    if (!result.success) {
      setErrors(fieldErrors(result.issues));
      return;
    }
    setErrors({});
    onSubmit(result.output);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid max-w-xl gap-5">
      {hasGeneralError ? (
        <Alert variant="destructive">
          <AlertTitle>
            {mode === "create"
              ? "Could not create room"
              : "Could not update room"}
          </AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      ) : null}

      <AuthFormField
        id="room_number"
        label="Room number"
        defaultValue={defaultValues?.room_number}
        error={errorFor("room_number")}
      />
      <AuthFormField
        id="room_name"
        label="Room name"
        defaultValue={defaultValues?.room_name}
        error={errorFor("room_name")}
      />
      <AuthFormField
        id="monthly_rent"
        label="Monthly rent (IDR)"
        type="number"
        inputMode="numeric"
        min={1}
        defaultValue={defaultValues?.monthly_rent}
        error={errorFor("monthly_rent")}
      />

      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as RoomStatus)}
        >
          <SelectTrigger id="status" className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {ROOM_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {ROOM_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errorFor("status") ? (
          <p className="text-sm text-destructive">{errorFor("status")}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes ?? ""}
        />
      </div>

      <div className="mt-2 flex gap-3">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending
            ? "Saving…"
            : mode === "create"
              ? "Create room"
              : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
