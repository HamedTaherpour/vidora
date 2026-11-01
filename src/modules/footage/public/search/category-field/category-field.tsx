import { Field, FieldLabel } from "@/components/ui/field";
import { AppSelect } from "@/components/app/app-select/app-select";

import type { SearchCategoryFieldProps } from "./category-field.types";

export function SearchCategoryField(props: SearchCategoryFieldProps) {
  const { query, categories, id = "explorer-category", icon, onChange } = props;

  return (
    <Field>
      <FieldLabel htmlFor={id}>{icon}دسته‌بندی</FieldLabel>
      <AppSelect
        name="category"
        id={id}
        value={query.category || "all"}
        onValueChange={(value) => onChange(value ?? "all")}
        options={[
          { value: "all", label: "همه دسته‌بندی‌ها" },
          ...categories.map((category) => ({
            value: category.value,
            label: category.labelFa,
          })),
        ]}
        className="w-full"
      />
    </Field>
  );
}
