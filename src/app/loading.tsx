import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="container-storefront py-10 md:py-16" aria-busy="true">
      <div className="flex flex-col gap-3" role="status">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-3/4 max-w-xl" />
        <Skeleton className="h-5 w-full max-w-2xl" />
        <Skeleton className="mt-8 h-5 w-40" />
        <Skeleton className="mt-4 h-64 w-full rounded-2xl" />
        <span className="sr-only">در حال بارگذاری صفحه…</span>
      </div>
    </main>
  );
}
