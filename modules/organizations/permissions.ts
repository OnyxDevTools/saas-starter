// filename: modules/organizations/permissions.ts
import { ensure } from "../../lib/errors";
import type { Role } from "../models";
export type Permission =
  "read" | "project" | "team" | "organization" | "billing" | "owners";
const matrix: Record<Role, readonly Permission[]> = {
  owner: ["read", "project", "team", "organization", "billing", "owners"],
  admin: ["read", "project", "team", "organization"],
  member: ["read", "project"],
};
export function permit(role: Role, permission: Permission) {
  ensure(
    matrix[role].includes(permission),
    403,
    "Your role does not permit this action.",
  );
}
export function protectLastOwner(
  ownerCount: number,
  oldRole: Role,
  newRole: Role | "removed",
) {
  ensure(
    !(oldRole === "owner" && newRole !== "owner" && ownerCount <= 1),
    409,
    "Every organization must keep at least one owner. Promote another owner first.",
  );
}
