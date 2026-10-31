export function HeroAtmosphere() {
  return (
    <div
      aria-hidden="true"
      data-slot="hero-atmosphere"
      className="pointer-events-none absolute inset-0 h-full w-full bg-foreground bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--primary)_38%,transparent),transparent_58%)]"
    />
  );
}
