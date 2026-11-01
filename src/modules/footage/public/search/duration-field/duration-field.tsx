import { Field, FieldLabel } from "@/components/ui/field";
import { AppSelect } from "@/components/app/app-select/app-select";

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
      <AppSelect
        name="duration"
        id={id}
        value={query.duration}
        onValueChange={handleChange}
        options={Object.entries(searchDurationLabels).map(([value, label]) => ({
          value,
          label,
        }))}
        className="w-full"
      />
    </Field>
  );
}
