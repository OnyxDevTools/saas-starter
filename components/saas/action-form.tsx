"use client";
// filename: components/saas/action-form.tsx
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { mutate } from "@/modules/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
export function ActionButton({
  operation,
  organizationId = "",
  input = {},
  children,
  variant = "outline",
  confirmText,
}: {
  operation: string;
  organizationId?: string;
  input?: unknown;
  children: React.ReactNode;
  variant?: "outline" | "default" | "destructive" | "ghost";
  confirmText?: string;
}) {
  const [pending, start] = useTransition(),
    [error, setError] = useState(""),
    [confirm, setConfirm] = useState(false);
  const router = useRouter();
  function run() {
    setError("");
    start(async () => {
      const result = await mutate(operation, organizationId, input);
      if (!result.ok) setError(result.error || "Operation failed.");
      else {
        setConfirm(false);
        if (result.destination) {
          if (result.destination.startsWith("https://"))
            window.location.assign(result.destination);
          else router.push(result.destination);
        }
        router.refresh();
      }
    });
  }
  return (
    <div className="space-y-2">
      <Button
        variant={variant}
        disabled={pending}
        onClick={() => (confirmText && !confirm ? setConfirm(true) : run())}
      >
        {pending ? "Working…" : confirm ? "Confirm" : children}
      </Button>
      {confirm && (
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>{confirmText}</span>
          <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-destructive max-w-lg text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
const formSchema = z.object({
  name: z.string().trim().min(2, "Use at least two characters.").max(120),
  description: z.string().max(2000),
});
export function NameForm({
  operation,
  organizationId = "",
  label = "Name",
  button = "Save changes",
  initialName = "",
  initialDescription = "",
  description = false,
  extra = {},
}: {
  operation: string;
  organizationId?: string;
  label?: string;
  button?: string;
  initialName?: string;
  initialDescription?: string;
  description?: boolean;
  extra?: Record<string, string>;
}) {
  const router = useRouter(),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(false),
    [requestId, setRequestId] = useState("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: initialName, description: initialDescription },
  });
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setError("");
        setSuccess(false);
        const key = requestId || crypto.randomUUID();
        setRequestId(key);
        const input = {
          name: values.name,
          ...(description ? { description: values.description } : {}),
          ...(operation.endsWith(".create") ? { requestId: key } : {}),
          ...extra,
        };
        const result = await mutate(operation, organizationId, input);
        if (!result.ok) setError(result.error || "Operation failed.");
        else {
          setSuccess(true);
          if (operation === "project.create") {
            form.reset();
            setRequestId("");
          }
          if (result.destination) router.push(result.destination);
          router.refresh();
        }
      })}
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor={`${operation}-name`}>{label}</Label>
        <Input
          id={`${operation}-name`}
          maxLength={operation.startsWith("organization") ? 80 : 120}
          aria-invalid={!!form.formState.errors.name}
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-destructive text-sm">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      {description && (
        <div className="space-y-2">
          <Label htmlFor={`${operation}-description`}>Description</Label>
          <Textarea
            id={`${operation}-description`}
            maxLength={2000}
            {...form.register("description")}
          />
        </div>
      )}
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-success text-sm">
          Saved successfully.
        </p>
      )}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : button}
      </Button>
    </form>
  );
}
