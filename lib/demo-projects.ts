// filename: lib/demo-projects.ts
import { z } from "zod";

export const projectStatuses = ["Active", "Planned", "Archived"] as const;
export const demoProjectSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(2, "Enter at least two characters.")
    .max(60, "Use 60 characters or fewer."),
  owner: z.string().trim().email("Enter a valid email address."),
  status: z.enum(projectStatuses),
});
export type ProjectValues = z.infer<typeof demoProjectSchema>;
export type DemoProject = ProjectValues & Readonly<{ id: string }>;

export const initialProjects: DemoProject[] = [
  {
    id: "customer-portal",
    name: "Customer portal",
    owner: "alex@example.com",
    status: "Active",
  },
  {
    id: "inventory",
    name: "Inventory system",
    owner: "sam@example.com",
    status: "Active",
  },
  {
    id: "analytics",
    name: "Analytics workspace",
    owner: "jordan@example.com",
    status: "Planned",
  },
  {
    id: "billing",
    name: "Billing console",
    owner: "alex@example.com",
    status: "Planned",
  },
  {
    id: "support",
    name: "Support desk",
    owner: "sam@example.com",
    status: "Active",
  },
  {
    id: "legacy",
    name: "Legacy migration",
    owner: "jordan@example.com",
    status: "Archived",
  },
];
