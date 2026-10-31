import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type SessionSearchParams = Promise<{
  continue?: string | string[];
}>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SessionPage({
  searchParams,
}: {
  searchParams: SessionSearchParams;
}) {
  const destination = firstParam((await searchParams).continue);
  redirect(
    destination
      ? `/login?continue=${encodeURIComponent(destination)}`
      : "/login",
  );
}
