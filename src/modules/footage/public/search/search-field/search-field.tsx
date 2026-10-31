import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import type { SearchFieldProps } from "./search-field.types";

export function SearchField(props: SearchFieldProps) {
  const { query, id = "explorer-filter-search", icon, onChange } = props;

  return (
    <Field>
      <FieldLabel htmlFor={id}>{icon}جست‌وجوی فوتیج</FieldLabel>
      <Input
        id={id}
        name="q"
        type="search"
        value={query}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder="موضوع، شهر یا حال‌وهوا"
      />
    </Field>
  );
}
