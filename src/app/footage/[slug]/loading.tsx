import { Skeleton } from "@/components/ui/skeleton";

export default function FootageLoading() {
  return (
    <main className="container-storefront py-10 md:py-16" aria-busy="true">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.55fr)]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-12 w-full max-w-3xl" />
            <Skeleton className="h-6 w-full max-w-2xl" />
          </div>
          <Skeleton className="aspect-video w-full" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    </main>
  );
}
