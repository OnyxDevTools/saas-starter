<!-- filename: docs/recipes/dialog-mutation.md -->

# Recipe: Dialog mutation

## When to use

A blocking create/edit flow, or an irreversible delete that needs confirmation.

## Constitutions

`radix.md`, `shadcn.md`, `sonner.md`, `ui-design.md`

## Create / edit (Dialog)

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>New item</Button>
  </DialogTrigger>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>New item</DialogTitle>
      <DialogDescription>Create an item in the workspace.</DialogDescription>
    </DialogHeader>
    {/* form fields */}
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button type="submit">Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Destructive confirm (Alert Dialog)

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete project</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete this project?</AlertDialogTitle>
      <AlertDialogDescription>
        This permanently removes the project. This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction variant="destructive">
        Delete project
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Rules

- Use Dialog for forms and non-destructive blocking tasks.
- Use Alert Dialog for irreversible actions; keep the confirm button `destructive`.
- Prefer Sheet for secondary side workflows that should not fully block the page.
- Toast success/failure after the mutation resolves.
