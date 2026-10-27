<!-- filename: docs/recipes/validated-form.md -->

# Recipe: Validated form

## When to use

Creating or editing structured input with typed validation.

## Constitutions

`react.md`, `react-hook-form.md`, `zod.md`, `sonner.md`, `ui-design.md`

## Pattern

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().trim().min(2, "Enter at least two characters."),
  owner: z.string().trim().email("Enter a valid email address."),
});

type Values = z.infer<typeof schema>;

export default function ProjectForm() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", owner: "" },
  });

  function onSubmit(values: Values) {
    toast.success("Project saved", { description: values.name });
  }

  return (
    <form
      className="max-w-md space-y-4"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="name">Project name</Label>
        <Input
          id="name"
          aria-invalid={Boolean(form.formState.errors.name)}
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="text-destructive text-sm">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="owner">Owner email</Label>
        <Input
          id="owner"
          type="email"
          aria-invalid={Boolean(form.formState.errors.owner)}
          {...form.register("owner")}
        />
        {form.formState.errors.owner ? (
          <p className="text-destructive text-sm">
            {form.formState.errors.owner.message}
          </p>
        ) : null}
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}
```

## Rules

- Single column by default; labels above fields.
- Put validation errors next to the field; do not toast field errors.
- Toast only after a successful (or failed) mutation.
