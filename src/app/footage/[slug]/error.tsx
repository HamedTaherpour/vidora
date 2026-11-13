"use client";

type FootageErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function FootageError({ reset }: FootageErrorProps) {
  return (
    <main>
      <h1>خطا در نمایش فوتیج</h1>
      <button onClick={reset}>تلاش دوباره</button>
    </main>
  );
}
