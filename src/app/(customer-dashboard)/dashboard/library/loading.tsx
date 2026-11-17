export default function DashboardLibraryLoading() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="در حال بارگذاری کتابخانه"
    >
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded-control bg-muted motion-reduce:animate-none" />
        <div className="h-10 w-56 animate-pulse rounded-control bg-muted motion-reduce:animate-none" />
        <div className="h-5 max-w-xl animate-pulse rounded-control bg-muted motion-reduce:animate-none" />
      </div>
      <div className="rounded-surface border-line border-border bg-card p-5 shadow-surface">
        <div className="h-12 w-full animate-pulse rounded-field bg-muted motion-reduce:animate-none" />
        <div className="mt-6 h-48 animate-pulse rounded-control bg-muted motion-reduce:animate-none" />
      </div>
    </div>
  );
}
