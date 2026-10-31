import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { SearchCategoryFieldProps } from "./category-field.types";

export function SearchCategoryField(props: SearchCategoryFieldProps) {
  const { query, categories, id = "explorer-category", icon, onChange } = props;

  return (
    <Field>
      <FieldLabel htmlFor={id}>{icon}دسته‌بندی</FieldLabel>
      <Select
        name="category"
        value={query.category || "all"}
        onValueChange={(value) => onChange(value ?? "all")}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue>
            {query.category
              ? categories.find((item) => item.value === query.category)
                  ?.labelFa
              : "همه دسته‌بندی‌ها"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.labelFa}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
