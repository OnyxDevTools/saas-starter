// filename: modules/services.ts
import "server-only";
import { createStore } from "../lib/onyx/store";
import { Organizations } from "./organizations/service";
import { Projects } from "./projects/service";
import { Invitations } from "./organizations/invitations";
import { Notifications } from "./notifications/service";
import { Billing } from "./billing/service";
export function services() {
  const organizations = new Organizations(createStore()),
    notifications = new Notifications(organizations);
  return {
    organizations,
    notifications,
    projects: new Projects(organizations),
    invitations: new Invitations(organizations, notifications),
    billing: new Billing(organizations),
  };
}
