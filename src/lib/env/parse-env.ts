import { z } from "zod";

export type EnvSource = Record<string, string | undefined>;

export class EnvironmentConfigError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid environment configuration:\n${issues.join("\n")}`);
    this.name = "EnvironmentConfigError";
    this.issues = issues;
  }
}

function issuePath(path: readonly PropertyKey[]): string {
  if (path.length === 0) {
    return "(root)";
  }

  return path.map(String).join(".");
}

function formatIssue(issue: {
  message: string;
  path: readonly PropertyKey[];
  input?: unknown;
}): string {
  let message = issue.message;

  if (
    typeof issue.input === "string" &&
    issue.input.length > 0 &&
    message.includes(issue.input)
  ) {
    message = message.replaceAll(issue.input, "[redacted]");
  }

  return `${issuePath(issue.path)}: ${message}`;
}

export function parseEnv<TShape extends z.ZodRawShape>(
  schema: z.ZodObject<TShape>,
  source: EnvSource,
): z.output<z.ZodObject<TShape>> {
  const result = schema.strip().safeParse(source);

  if (!result.success) {
    throw new EnvironmentConfigError(
      result.error.issues.map((issue) =>
        formatIssue({
          message: issue.message,
          path: issue.path,
          input: "input" in issue ? issue.input : undefined,
        }),
      ),
    );
  }

  return result.data;
}
