// filename: lib/onyx/store.ts
import "server-only";
import { onyx, asc, eq } from "@onyx.dev/onyx-database";
import { schemas, type Rows, type Table } from "../../modules/models";
import { AppError } from "../errors";
export interface Store {
  get<K extends Table>(table: K, id: string): Promise<Rows[K] | null>;
  insert<K extends Table>(table: K, row: Rows[K]): Promise<void>;
  update<K extends Table>(table: K, row: Rows[K]): Promise<void>;
  remove(table: Table, id: string): Promise<void>;
  page<K extends Table>(
    table: K,
    where: Partial<Rows[K]>,
    limit?: number,
    cursor?: string,
  ): Promise<{ items: Rows[K][]; cursor?: string }>;
}
function storageError(error: unknown): never {
  if (error instanceof AppError) throw error;
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    error.status === 409
  )
    throw new AppError(
      409,
      "A conflicting operation already exists. Retry after the current operation completes.",
    );
  throw new AppError(
    503,
    "Onyx is unavailable or not configured. Check the downloaded configuration and schema.",
  );
}
export function createStore(): Store {
  // No database construction at module import; use the existing SDK resolver.
  const db = onyx.init<Rows>({
    wireFormat: "json",
    requestLoggingEnabled: false,
    responseLoggingEnabled: false,
    retry: { enabled: false },
    fetch: async (input, init) =>
      fetch(input, {
        ...init,
        body:
          init?.body instanceof Uint8Array
            ? new Uint8Array(init.body).buffer
            : (init?.body ?? null),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }),
  });
  return {
    async get<K extends Table>(table: K, id: string) {
      try {
        const row = await db.findById(table, id);
        return row == null ? null : (schemas[table].parse(row) as Rows[K]);
      } catch (error) {
        return storageError(error);
      }
    },
    async insert<K extends Table>(table: K, row: Rows[K]) {
      try {
        await db.insert(table, schemas[table].parse(row) as Rows[K]);
      } catch (error) {
        storageError(error);
      }
    },
    async update<K extends Table>(table: K, row: Rows[K]) {
      try {
        const valid = schemas[table].parse(row) as Rows[K];
        const count = await db
          .from(table)
          .where(eq("id", valid.id))
          .setUpdates(valid)
          .update();
        if (count !== 1)
          throw new AppError(
            409,
            "The record changed or no longer exists. Refresh and retry.",
          );
      } catch (error) {
        storageError(error);
      }
    },
    async remove(table, id) {
      try {
        await db.delete(table, id);
      } catch (error) {
        storageError(error);
      }
    },
    async page<K extends Table>(
      table: K,
      where: Partial<Rows[K]>,
      limit = 100,
      cursor?: string,
    ) {
      try {
        if (limit < 1 || limit > 100 || (cursor && cursor.length > 4096))
          throw new AppError(422, "Invalid page request.");
        let query = db.from(table);
        let filtered = false;
        for (const [field, value] of Object.entries(where)) {
          query = filtered
            ? query.and(eq(field, value))
            : query.where(eq(field, value));
          filtered = true;
        }
        const result = await query
          .orderBy(asc("id"))
          .page({ pageSize: limit, ...(cursor ? { nextPage: cursor } : {}) });
        return {
          items: result.records.map(
            (row) => schemas[table].parse(row) as Rows[K],
          ),
          ...(result.nextPage ? { cursor: result.nextPage } : {}),
        };
      } catch (error) {
        return storageError(error);
      }
    },
  };
}
export async function collect<K extends Table>(
  store: Store,
  table: K,
  where: Partial<Rows[K]>,
) {
  const items: Rows[K][] = [];
  let cursor: string | undefined;
  for (let batch = 0; batch < 20; batch++) {
    const page = await store.page(table, where, 100, cursor);
    items.push(...page.items);
    cursor = page.cursor;
    if (!cursor) return items;
  }
  throw new AppError(
    503,
    "This organization exceeds the starter's bounded scan budget. Add indexed aggregate or pagination support before growing further.",
  );
}
