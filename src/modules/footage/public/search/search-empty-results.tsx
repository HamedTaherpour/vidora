export function SearchEmptyResults() {
  return (
    <div
      className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-16 text-center"
      role="status"
    >
      <h2 className="text-xl font-semibold">
        نتیجه‌ای برای این ترکیب پیدا نشد
      </h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        فیلترها را کمی بازتر کن یا عبارت جست‌وجو را تغییر بده.
      </p>
    </div>
  );
}
