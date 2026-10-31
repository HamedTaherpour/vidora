import { permanentRedirect } from "next/navigation";

type LegacyFootagePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyFootagePage(props: LegacyFootagePageProps) {
  const params = await props.searchParams;
  const search = new URLSearchParams();

  for (const key of [
    "q",
    "category",
    "minPrice",
    "maxPrice",
    "duration",
    "sort",
    "page",
  ]) {
    const value = params[key];
    if (typeof value === "string") search.set(key, value);
    else if (Array.isArray(value) && value[0]) search.set(key, value[0]);
  }

  permanentRedirect(search.toString() ? `/search?${search}` : "/search");
}
