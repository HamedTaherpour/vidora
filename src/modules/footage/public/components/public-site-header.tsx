import Image from "next/image";
import Link from "next/link";

export function PublicSiteHeader() {
  return (
    <header
      data-slot="public-site-header"
      data-sticky-header
      className="sticky top-0 z-30 border-b border-border/60 bg-background"
    >
      <div className="container-storefront flex min-h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
        >
          <Image
            src="/images/brand/logo-with-text.png"
            alt="ویدورا"
            width={1332}
            height={303}
            priority
            className="h-auto w-28 sm:w-32"
          />
        </Link>
        <nav
          aria-label="ناوبری اصلی"
          className="flex items-center gap-2 sm:gap-5"
        >
          <Link
            href="/#catalog-heading"
            className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            کشف فوتیج
          </Link>
          <Link
            href="/session"
            className="rounded-md px-2 py-1 text-sm font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            ورود به حساب
          </Link>
        </nav>
      </div>
    </header>
  );
}
