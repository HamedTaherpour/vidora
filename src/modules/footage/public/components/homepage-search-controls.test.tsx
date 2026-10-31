import { Children, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

const routerPush = vi.hoisted(() => vi.fn());
const setDraftQuery = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useState: vi.fn(() => [" بارانی ", setDraftQuery]),
  };
});

import {
  HomepageSearchControls,
  hasHomepageClearableState,
} from "@/modules/footage/public/components/homepage-search-controls";

type ControlElement = ReactElement<Record<string, unknown>>;

function isControlElement(child: ReactNode): child is ControlElement {
  return typeof child === "object" && child !== null && "type" in child;
}

function findElementsByControl(
  node: ReactNode,
  control: string,
): ControlElement[] {
  return Children.toArray(node).flatMap((child) => {
    if (!isControlElement(child)) return [];

    const matches =
      child.props["data-control"] === control
        ? [child]
        : ([] as ControlElement[]);

    return [
      ...matches,
      ...findElementsByControl(child.props.children as ReactNode, control),
    ];
  });
}

function getControlElements() {
  const card = HomepageSearchControls({
    query: "قدیمی",
    category: "urban",
    categories: [
      { value: "nature", labelFa: "طبیعت" },
      { value: "urban", labelFa: "شهری" },
      { value: "travel", labelFa: "سفر" },
      { value: "technology", labelFa: "تکنولوژی" },
      { value: "business", labelFa: "کسب‌وکار" },
    ],
    scenario: "populated",
  }) as unknown as ControlElement;
  const cardContent = card.props.children as ControlElement;
  const cardChildren = Children.toArray(
    cardContent.props.children as ReactNode,
  ) as ControlElement[];
  const form = cardChildren.find((child) => child.type === "form")!;
  const suggestedSection = cardChildren.find(
    (child) => child.props["data-slot"] === "suggested-categories",
  )!;
  const children = Children.toArray(
    form.props.children as ReactNode,
  ) as ControlElement[];

  return {
    form,
    clearButton: children.find(
      (child) => child.props["aria-label"] === "پاک کردن جست‌وجو و فیلترها",
    )!,
    submitButton: children.find((child) => child.props.type === "submit"),
    categoryLabel: children.find((child) => child.type === "label")!,
    suggestedButtons: findElementsByControl(
      suggestedSection.props.children as ReactNode,
      "suggested-category",
    ),
  };
}

describe("HomepageSearchControls interactions", () => {
  it("only enables clearable state for applied or draft values", () => {
    expect(
      hasHomepageClearableState({
        query: "",
        category: "",
        draftQuery: "   ",
      }),
    ).toBe(false);
    expect(
      hasHomepageClearableState({
        query: "",
        category: "urban",
        draftQuery: "",
      }),
    ).toBe(true);
    expect(
      hasHomepageClearableState({
        query: "بارانی",
        category: "",
        draftQuery: "بارانی",
      }),
    ).toBe(true);
    expect(
      hasHomepageClearableState({
        query: "",
        category: "",
        draftQuery: "بارانی",
      }),
    ).toBe(true);
  });

  it("submits the draft query while preserving the applied category", () => {
    const { form } = getControlElements();
    const preventDefault = vi.fn();

    (form.props.onSubmit as (event: { preventDefault: () => void }) => void)({
      preventDefault,
    });

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(routerPush).toHaveBeenLastCalledWith(
      "/?q=%D8%A8%D8%A7%D8%B1%D8%A7%D9%86%DB%8C&category=urban&scenario=populated",
    );
  });

  it("changes category immediately while preserving the applied query", () => {
    const { categoryLabel } = getControlElements();
    const select = Children.toArray(
      categoryLabel.props.children as ReactNode,
    ).find(
      (child): child is ControlElement =>
        isControlElement(child) && "onValueChange" in child.props,
    )!;

    (select.props.onValueChange as (value: string) => void)("nature");

    expect(routerPush).toHaveBeenLastCalledWith(
      "/?q=%D9%82%D8%AF%DB%8C%D9%85%DB%8C&category=nature&scenario=populated",
    );
  });

  it("uses the installed Select and Separator primitives", () => {
    const { form } = getControlElements();
    const children = Children.toArray(form.props.children as ReactNode);
    const selectLabel = children.find(
      (child): child is ControlElement =>
        isControlElement(child) && child.type === "label",
    )!;
    const select = Children.toArray(
      selectLabel.props.children as ReactNode,
    ).find(
      (child): child is ControlElement =>
        isControlElement(child) && "onValueChange" in child.props,
    )!;
    const separator = children.find(
      (child): child is ControlElement =>
        isControlElement(child) && child.props.orientation === "vertical",
    );

    expect(select).toBeDefined();
    expect(separator).toBeDefined();
    expect(separator?.props.orientation).toBe("vertical");
  });

  it("keeps visible focus styles on the borderless controls", () => {
    const { form } = getControlElements();
    const children = Children.toArray(form.props.children as ReactNode);
    const input = children.find(
      (child): child is ControlElement =>
        isControlElement(child) &&
        child.props["data-control"] === "search-input",
    )!;
    const selectLabel = children.find(
      (child): child is ControlElement =>
        isControlElement(child) && child.type === "label",
    )!;
    const select = Children.toArray(
      selectLabel.props.children as ReactNode,
    ).find(
      (child): child is ControlElement =>
        isControlElement(child) && "onValueChange" in child.props,
    )!;
    const selectTrigger = Children.toArray(
      select.props.children as ReactNode,
    ).find(
      (child): child is ControlElement =>
        isControlElement(child) && child.props["data-control"] === "category",
    )!;

    expect(input.props.className).not.toContain("focus-visible:ring-0");
    expect(selectTrigger.props.className).not.toContain("focus-visible:ring-0");
  });

  it("renders the first four ordered categories and applies suggestions", () => {
    const { suggestedButtons } = getControlElements();

    expect(suggestedButtons).toHaveLength(4);
    expect(
      suggestedButtons.map((button) => button.props["data-category"]),
    ).toEqual(["nature", "urban", "travel", "technology"]);
    expect(
      suggestedButtons.map((button) =>
        Children.toArray(button.props.children as ReactNode).find(
          (child): child is string => typeof child === "string",
        ),
      ),
    ).toEqual(["طبیعت", "شهری", "سفر", "تکنولوژی"]);
  });

  it("preserves the applied query and resets an active suggestion", () => {
    const { suggestedButtons } = getControlElements();
    const urbanButton = suggestedButtons.find(
      (button) => button.props["data-category"] === "urban",
    )!;
    const travelButton = suggestedButtons.find(
      (button) => button.props["data-category"] === "travel",
    )!;

    expect(urbanButton.props["aria-pressed"]).toBe(true);
    expect(travelButton.props["aria-pressed"]).toBe(false);

    (travelButton.props.onClick as () => void)();

    expect(routerPush).toHaveBeenLastCalledWith(
      "/?q=%D9%82%D8%AF%DB%8C%D9%85%DB%8C&category=travel&scenario=populated",
    );

    (urbanButton.props.onClick as () => void)();

    expect(routerPush).toHaveBeenLastCalledWith(
      "/?q=%D9%82%D8%AF%DB%8C%D9%85%DB%8C&scenario=populated",
    );
  });

  it("clears draft and applied state while preserving the fixture scenario", () => {
    const { clearButton } = getControlElements();

    (clearButton.props.onClick as () => void)();

    expect(setDraftQuery).toHaveBeenCalledWith("");
    expect(routerPush).toHaveBeenLastCalledWith("/?scenario=populated");
  });
});
