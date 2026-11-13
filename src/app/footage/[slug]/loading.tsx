export default function FootageLoading() {
  return (
    <main
      aria-busy="true"
      className="min-h-screen bg-background p-6 text-foreground"
    >
      <p className="mx-auto max-w-7xl text-muted-foreground">
        در حال بارگذاری جزئیات فوتیج…
      </p>
    </main>
  );
}
