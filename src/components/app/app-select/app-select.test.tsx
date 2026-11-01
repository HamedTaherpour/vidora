// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppSelect } from "./app-select";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const options = [
  { value: "all", label: "همه" },
  { value: "nature", label: "طبیعت" },
] as const;

describe("AppSelect", () => {
  let container!: HTMLDivElement;
  let root: Root | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
  });

  afterEach(() => {
    act(() => root?.unmount());
    container.remove();
    document.body
      .querySelectorAll('[data-slot="select-content"]')
      .forEach((element) => element.remove());
  });

  it("renders the selected label and accessible trigger contract", () => {
    root = createRoot(container);

    act(() => {
      root!.render(
        <AppSelect
          id="search-category"
          name="category"
          defaultValue="nature"
          options={options}
          aria-label="دسته‌بندی"
          data-control="category"
          className="w-full"
        />,
      );
    });

    const trigger = container.querySelector<HTMLButtonElement>(
      '[data-slot="select-trigger"]',
    );
    expect(trigger?.id).toBe("search-category");
    expect(trigger?.getAttribute("aria-label")).toBe("دسته‌بندی");
    expect(trigger?.getAttribute("data-control")).toBe("category");
    expect(trigger?.textContent).toContain("طبیعت");
    expect(container.querySelector('input[name="category"]')).not.toBeNull();
  });

  it("adds the reusable ghost treatment without changing the default trigger", () => {
    root = createRoot(container);

    act(() => {
      root!.render(
        <AppSelect
          options={options}
          triggerVariant="ghost"
          className="h-9 min-w-32"
          aria-label="دسته‌بندی"
        />,
      );
    });

    const trigger = container.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    );
    expect(trigger?.className).toContain("border-0");
    expect(trigger?.className).toContain("bg-transparent");
    expect(trigger?.className).toContain("shadow-none");
    expect(trigger?.className).toContain("h-9");
    expect(trigger?.className).toContain("min-w-32");

    act(() => root?.unmount());
    root = createRoot(container);
    act(() => {
      root!.render(<AppSelect options={options} aria-label="دسته‌بندی" />);
    });

    const defaultTrigger = container.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    );
    expect(defaultTrigger?.className).not.toContain("border-0");
    expect(defaultTrigger?.className).not.toContain("shadow-none");
  });

  it("preserves primitive item interaction and change callbacks", () => {
    const onValueChange = vi.fn();
    root = createRoot(container);

    act(() => {
      root!.render(
        <AppSelect
          value="all"
          options={options}
          onValueChange={onValueChange}
          aria-label="دسته‌بندی"
        />,
      );
    });

    const trigger = container.querySelector<HTMLButtonElement>(
      '[data-slot="select-trigger"]',
    );
    act(() => trigger?.click());

    const item = Array.from(
      document.querySelectorAll<HTMLElement>('[data-slot="select-item"]'),
    ).find((element) => element.textContent?.includes("طبیعت"));
    expect(item).not.toBeNull();
    act(() => item?.click());

    expect(onValueChange).toHaveBeenCalledWith("nature");
  });
});
