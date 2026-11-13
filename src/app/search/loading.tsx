import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <Skeleton className="hidden h-96 rounded-surface lg:block" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="aspect-video rounded-surface" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
