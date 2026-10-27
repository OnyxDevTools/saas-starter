// filename: scripts/recover-lock.ts
import { parseArgs } from "node:util";
import { createStore } from "../lib/onyx/store";
const { values } = parseArgs({
  options: {
    scope: { type: "string" },
    "confirm-writers-stopped": { type: "boolean" },
  },
  strict: true,
});
if (
  !values.scope ||
  !values["confirm-writers-stopped"] ||
  !/^(organization|user):[^\x00-\x1f\x7f]{1,128}$/.test(values.scope)
)
  throw new Error(
    "Stop every writer and use --scope organization:<id> --confirm-writers-stopped (or user:<uid>). Inspect persisted operation state before recovery.",
  );
const store = createStore();
const lock = await store.get("MutationLock", values.scope);
if (lock) {
  console.log(
    `Recovering ${lock.operation}; inspect affected records and retry the original idempotent action where supported.`,
  );
  await store.remove("MutationLock", values.scope);
} else console.log("No lock exists for that scope.");
