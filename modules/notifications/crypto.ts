// filename: modules/notifications/crypto.ts
import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { ensure } from "../../lib/errors";
function key() {
  const value = Buffer.from(
    process.env.NOTIFICATION_ENCRYPTION_KEY || "",
    "base64",
  );
  ensure(
    value.length === 32,
    503,
    "Set NOTIFICATION_ENCRYPTION_KEY using npm run setup:secrets before creating invitations.",
  );
  return value;
}
export function encryptToken(token: string) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString(
    "base64url",
  );
}
export function decryptToken(value: string) {
  const bytes = Buffer.from(value, "base64url"),
    decipher = createDecipheriv("aes-256-gcm", key(), bytes.subarray(0, 12));
  decipher.setAuthTag(bytes.subarray(12, 28));
  return Buffer.concat([
    decipher.update(bytes.subarray(28)),
    decipher.final(),
  ]).toString("utf8");
}
