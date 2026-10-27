// filename: lib/locks.ts
import "server-only";
import { AppError } from "./errors";
import type { Store } from "./onyx/store";
// Insert-only IDs provide exclusion across all application instances. No TTL
// takeover or undocumented CAS/transaction behavior is assumed. Unknown failures
// retain the lock for explicit recovery with all writers stopped.
export async function exclusively<T>(
  store: Store,
  id: string,
  operation: string,
  work: () => Promise<T>,
): Promise<T> {
  await store.insert("MutationLock", {
    id,
    operation,
    acquiredAt: new Date().toISOString(),
  });
  try {
    const result = await work();
    await store.remove("MutationLock", id);
    return result;
  } catch (error) {
    if (error instanceof AppError && error.status < 500)
      await store.remove("MutationLock", id);
    throw error;
  }
}
