"use client";
// filename: components/saas/invite-form.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { mutate } from "@/modules/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const schema = z.object({
  email: z.email(),
  role: z.enum(["member", "admin"]),
});
export function InviteForm({
  organizationId,
  isOwner,
}: {
  organizationId: string;
  isOwner: boolean;
}) {
  const [error, setError] = useState(""),
    [success, setSuccess] = useState(false),
    router = useRouter();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", role: "member" },
  });
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setError("");
        setSuccess(false);
        const result = await mutate(
          "invitation.create",
          organizationId,
          values,
        );
        if (result.ok) {
          form.reset();
          setSuccess(true);
          router.refresh();
        } else setError(result.error || "Invitation failed.");
      })}
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="invite-email">Invitation email</Label>
        <Input id="invite-email" type="email" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-destructive text-sm">Enter a valid email.</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-role">Role</Label>
        <select
          id="invite-role"
          className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm"
          {...form.register("role")}
        >
          <option value="member">Member</option>
          {isOwner && <option value="admin">Administrator</option>}
        </select>
      </div>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-success text-sm">
          Invitation created. Open the authenticated outbox to review and share
          it.
        </p>
      )}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        Invite teammate
      </Button>
    </form>
  );
}
