// filename: scripts/secrets.mjs
import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
const path = new URL("../.env.local", import.meta.url);
let current = "";
try {
  current = await readFile(path, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
if (!/^NOTIFICATION_ENCRYPTION_KEY=/m.test(current)) {
  current += `\nNOTIFICATION_ENCRYPTION_KEY=${randomBytes(32).toString("base64")}\n`;
  await writeFile(path, current, { mode: 0o600 });
  console.log(
    "Created invitation encryption key in ignored .env.local. Keep it stable and back it up securely.",
  );
} else console.log("Existing invitation encryption key preserved.");
