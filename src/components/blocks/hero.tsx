import { GodraysBackground } from "@/components/backgrounds/godrays";
import type { HeroBlockProps } from "./hero.types";

/** Official VibeFarsiUI `hero` block, adapted with a Vidora search slot. */
export function HeroBlock(props: HeroBlockProps) {
  const { badge, title, description, children } = props;
  return (
    <section className="relative isolate overflow-hidden border-b border-border/70 px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <GodraysBackground className="-z-10 opacity-80" opacity={0.34} />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--brand)_12%,transparent),transparent_58%)]"
        aria-hidden="true"
      />
      <div
        className="home-hero-grid absolute inset-0 -z-10 opacity-70"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-3xl text-center">
        {badge && (
          <p className="mx-auto inline-flex items-center gap-2 rounded-control border-line border-brand/40 bg-brand/10 px-3 py-1 text-sm text-brand">
            <span className="size-1.5 rounded-full bg-brand" />
            {badge}
          </p>
        )}
        <h1 className="mt-5 text-4xl font-bold leading-[1.2] sm:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
          {description}
        </p>
        {children && <div className="mx-auto mt-6 max-w-2xl">{children}</div>}
      </div>
    </section>
  );
}
