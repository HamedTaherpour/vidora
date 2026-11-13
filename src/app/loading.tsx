import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="space-y-4">
        <Skeleton shimmer className="h-8 w-48" />
        <Skeleton shimmer className="h-12 w-full max-w-2xl" />
        <div className="grid gap-4 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} shimmer className="aspect-video w-full" />
          ))}
        </div>
      </div>
      <p className="sr-only">در حال بارگذاری صفحه…</p>
    </main>
  );
}
