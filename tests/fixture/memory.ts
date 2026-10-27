// filename: tests/fixture/memory.ts
// Only unit tests import this store; production always constructs the Onyx adapter.
import type { Store } from "../../lib/onyx/store";
import { AppError } from "../../lib/errors";
import { schemas, type Rows, type Table } from "../../modules/models";
export class MemoryStore implements Store {
  private readonly rows = new Map<Table, Map<string, unknown>>();
  failNextUpdate = false;
  private table(name: Table) {
    let rows = this.rows.get(name);
    if (!rows) {
      rows = new Map();
      this.rows.set(name, rows);
    }
    return rows;
  }
  async get<K extends Table>(table: K, id: string): Promise<Rows[K] | null> {
    const value = this.table(table).get(id);
    return value
      ? (structuredClone(schemas[table].parse(value)) as Rows[K])
      : null;
  }
  async insert<K extends Table>(table: K, row: Rows[K]) {
    const rows = this.table(table);
    if (rows.has(row.id)) throw new AppError(409, "Conflict");
    rows.set(row.id, structuredClone(schemas[table].parse(row)));
  }
  async update<K extends Table>(table: K, row: Rows[K]) {
    if (this.failNextUpdate) {
      this.failNextUpdate = false;
      throw new AppError(503, "Uncertain test write");
    }
    if (!this.table(table).has(row.id)) throw new AppError(409, "Missing row");
    this.table(table).set(row.id, structuredClone(schemas[table].parse(row)));
  }
  async remove(table: Table, id: string) {
    this.table(table).delete(id);
  }
  async page<K extends Table>(
    table: K,
    where: Partial<Rows[K]>,
    limit = 100,
    cursor?: string,
  ) {
    const rows = [...this.table(table).values()]
      .map((row) => schemas[table].parse(row) as Rows[K])
      .filter((row) =>
        Object.entries(where).every(
          ([key, value]) => Reflect.get(row, key) === value,
        ),
      )
      .sort((a, b) => a.id.localeCompare(b.id));
    const start = Number(cursor || 0);
    return {
      items: structuredClone(rows.slice(start, start + limit)),
      ...(start + limit < rows.length ? { cursor: String(start + limit) } : {}),
    };
  }
}
