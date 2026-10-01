import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadLocalEnvFiles } from "@/lib/env/load-local-env-files";

const probeKey = "VIDORA_ENV_LOAD_PROBE";
const directories: string[] = [];

async function writeEnvFile(
  directory: string,
  name: string,
  value: string,
): Promise<void> {
  await writeFile(path.join(directory, name), `${probeKey}=${value}\n`, "utf8");
}

describe("loadLocalEnvFiles", () => {
  afterEach(async () => {
    delete process.env[probeKey];
    await Promise.all(
      directories
        .splice(0)
        .map((directory) => rm(directory, { recursive: true, force: true })),
    );
  });

  it("lets .env.local override .env", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "vidora-env-"));
    directories.push(directory);
    await writeEnvFile(directory, ".env", "from-env");
    await writeEnvFile(directory, ".env.local", "from-local");

    loadLocalEnvFiles({ nodeEnv: "development", cwd: directory });

    expect(process.env[probeKey]).toBe("from-local");
  });

  it("does not override a variable already set in the environment", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "vidora-env-"));
    directories.push(directory);
    await writeEnvFile(directory, ".env.local", "from-local");
    process.env[probeKey] = "already-set";

    loadLocalEnvFiles({ nodeEnv: "development", cwd: directory });

    expect(process.env[probeKey]).toBe("already-set");
  });

  it("skips .env.local when NODE_ENV is test", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "vidora-env-"));
    directories.push(directory);
    await writeEnvFile(directory, ".env", "from-env");
    await writeEnvFile(directory, ".env.local", "from-local");

    loadLocalEnvFiles({ nodeEnv: "test", cwd: directory });

    expect(process.env[probeKey]).toBe("from-env");
  });
});
