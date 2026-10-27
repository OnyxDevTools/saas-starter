// filename: app/components/page-header.tsx
type PageHeaderProps = Readonly<{
  title: string;
  description: string;
  actions?: React.ReactNode;
}>;

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">{description}</p>
      </div>
      {actions}
    </header>
  );
}
