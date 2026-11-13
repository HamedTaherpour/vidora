"use client";

import { useEffect, useState } from "react";
import type { HomeSeoTocProps } from "./home-seo-toc.types";

export function HomeSeoToc(props: HomeSeoTocProps) {
  const { items } = props;
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));
    if (!headings.length) return;

    const syncFromHash = () => {
      const hashId = window.location.hash.slice(1);
      if (items.some((item) => item.id === hashId)) setActiveId(hashId);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const hashId = window.location.hash.slice(1);
        if (hashId && visible.some((entry) => entry.target.id === hashId)) {
          setActiveId(hashId);
          return;
        }
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-112px 0px -55% 0px", threshold: [0, 0.25, 0.75] },
    );
    headings.forEach((heading) => observer.observe(heading));
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [items]);

  return (
    <aside className="self-start lg:sticky lg:top-24">
      <p className="text-sm font-semibold text-muted-foreground">
        در این راهنما
      </p>
      <nav
        aria-label="بخش‌های راهنمای فوتیج"
        className="mt-4 border-s border-border/70 ps-4"
      >
        <ul className="space-y-1 text-sm leading-6 text-muted-foreground">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={activeId === item.id ? "location" : undefined}
                className={`block rounded-control px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeId === item.id ? "bg-accent font-semibold text-foreground" : "hover:text-foreground"}`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
