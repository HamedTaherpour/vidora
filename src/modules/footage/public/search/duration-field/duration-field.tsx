import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { searchDurationLabels } from "../search-filters/search-filters.constants";
import type { SearchDurationFieldProps } from "./duration-field.types";

export function SearchDurationField(props: SearchDurationFieldProps) {
  const { query, id = "explorer-duration", icon, onChange } = props;

  function handleChange(value: string | null) {
    onChange(
      value === "short" || value === "medium" || value === "long"
        ? value
        : "all",
    );
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>{icon}مدت</FieldLabel>
      <Select
        name="duration"
        value={query.duration}
        onValueChange={handleChange}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue>{searchDurationLabels[query.duration]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(searchDurationLabels).map(([value, label]) => (
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
