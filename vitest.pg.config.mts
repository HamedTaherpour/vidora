import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.pg.test.ts"],
    exclude: ["**/node_modules/**", "**/.git/**"],
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 30_000,
  },
  resolve: {
    alias: [
      {
        find: "server-only",
        replacement: path.resolve(rootDir, "test/server-only-stub.ts"),
      },
      {
        find: "@",
        replacement: path.resolve(rootDir, "./src"),
      },
    ],
  },
});
