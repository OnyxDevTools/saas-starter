// filename: knip.config.ts
import type { KnipConfig } from "knip";

const config = {
  // Zustand is an intentional baseline dependency. Do not create a store until
  // shared, client-owned state has a concrete owner.
  ignoreDependencies: ["zustand", "firebase-tools"],
  // Firebase tools is launched by absolute CLI path in the explicit emulator runner.
  entry: ["tests/fixture/users.ts"],
  ignoreIssues: { "lib/onyx/generated.ts": ["exports", "types"] },
  // shadcn variant exports are public APIs and are also consumed in their file.
  ignoreExportsUsedInFile: true,
  vitest: {
    config: ["vitest.config.ts"],
  },
} satisfies KnipConfig;

export default config;
