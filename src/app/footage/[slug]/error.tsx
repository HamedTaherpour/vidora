"use client";

type FootageErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function FootageError({ reset }: FootageErrorProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl">خطا در نمایش فوتیج</h1>
        <button
          className="rounded-control border border-border px-4 py-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={reset}
        >
          تلاش دوباره
        </button>
      </div>
    </main>
  );
}
