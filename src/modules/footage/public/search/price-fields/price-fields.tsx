import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { formatTomanDisplay } from "@/modules/footage/format-toman-display";

import type { SearchPriceFieldsProps } from "./price-fields.types";

function toPriceRange(
  value: number | readonly number[],
): [number, number] | undefined {
  if (typeof value === "number" || value.length !== 2) return undefined;
  const [minimum, maximum] = value;
  return minimum === undefined || maximum === undefined
    ? undefined
    : [minimum, maximum];
}

export function SearchPriceFields(props: SearchPriceFieldsProps) {
  const { query, priceBounds, value, id, onChange, onCommit, onReset } = props;

  function handleValueChange(next: number | readonly number[]) {
    const range = toPriceRange(next);
    if (range) onChange(range);
  }

  function handleValueCommit(next: number | readonly number[]) {
    const range = toPriceRange(next);
    if (range) onCommit(range);
  }

  return (
    <div className="flex flex-col gap-3">
      <FieldLabel htmlFor={id}>محدوده قیمت</FieldLabel>
      <Slider
        id={id}
        aria-label="محدوده قیمت فوتیج"
        value={value}
        min={priceBounds.min}
        max={priceBounds.max}
        step={priceBounds.step}
        direction="rtl"
        locale="fa-IR"
        minStepsBetweenValues={0}
        thumbCollisionBehavior="none"
        getAriaLabel={(index) => (index === 0 ? "حداقل قیمت" : "حداکثر قیمت")}
        getAriaValueText={(formattedValue, _, index) =>
          (index === 0 ? "حداقل" : "حداکثر") + " " + formattedValue + " تومان"
        }
        onValueChange={handleValueChange}
        onValueCommitted={handleValueCommit}
      />
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{formatTomanDisplay(value[0])}</span>
        <span>{formatTomanDisplay(value[1])}</span>
      </div>
      {(query.minPrice !== undefined || query.maxPrice !== undefined) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={onReset}
        >
          حذف محدوده قیمت
        </Button>
      )}
    </div>
  );
}
