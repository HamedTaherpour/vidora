/**
 * Next.js skips `register` during `next build`.
 * The root layout also imports server environment configuration so a
 * production build fails when required server configuration is invalid.
 */
export async function register(): Promise<void> {
  await import("@/lib/env/server");
}
