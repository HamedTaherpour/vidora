export default function FootageNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl">فوتیج پیدا نشد</h1>
        <p className="text-muted-foreground">
          این فوتیج منتشر نشده یا دیگر در دسترس نیست.
        </p>
        <a
          className="text-brand underline-offset-4 hover:underline"
          href="/search"
        >
          بازگشت به مرور فوتیج‌ها
        </a>
      </div>
    </main>
  );
}
