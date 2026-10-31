import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SEARCH_SORTS, type SearchSort } from "../search";
import { searchSortLabels } from "../search-filters/search-filters.constants";
import type { SearchSortFieldProps } from "./sort-field.types";

export function SearchSortField(props: SearchSortFieldProps) {
  const { query, id, icon, onChange } = props;

  function handleChange(value: string | null) {
    if (value && SEARCH_SORTS.includes(value as SearchSort)) {
      onChange(value as SearchSort);
    }
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>{icon}مرتب‌سازی</FieldLabel>
      <Select name="sort" value={query.sort} onValueChange={handleChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue>{searchSortLabels[query.sort]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(searchSortLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
