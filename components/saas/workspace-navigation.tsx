"use client";
// filename: components/saas/workspace-navigation.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  Mail,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
const items: { path: string; label: string; icon: LucideIcon }[] = [
  { path: "", label: "Overview", icon: LayoutDashboard },
  { path: "/projects", label: "Projects", icon: FolderKanban },
  { path: "/team", label: "Team", icon: Users },
  { path: "/billing", label: "Billing", icon: CreditCard },
  { path: "/activity", label: "Activity", icon: Activity },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/outbox", label: "Outbox", icon: Mail },
];
export function WorkspaceNavigation({
  base,
  canManage,
  mobile = false,
}: {
  base: string;
  canManage: boolean;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  return (
    <nav
      aria-label={
        mobile ? "Mobile workspace navigation" : "Workspace navigation"
      }
      className={
        mobile
          ? "flex w-full gap-2 overflow-x-auto pb-3 text-xs lg:hidden"
          : "mt-5 space-y-1.5"
      }
    >
      {items
        .filter((item) => canManage || item.path !== "/outbox")
        .map(({ path, label, icon: Icon }) => {
          const href = `${base}${path}`,
            active = path ? pathname.startsWith(href) : pathname === href;
          return (
            <Link
              key={path}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-visible:ring-ring flex shrink-0 items-center gap-3 rounded-xl font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                mobile ? "px-3 py-2" : "px-3.5 py-3 text-sm",
                mobile
                  ? active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  : active
                    ? "bg-sidebar-active text-sidebar-active-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              {!mobile && (
                <Icon
                  className="size-4"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              )}
              {label}
            </Link>
          );
        })}
    </nav>
  );
}
