import { updateAdminFootageMetadataAction } from "./update-admin-footage-metadata-action";
import type { AdminFootageMetadataFormProps } from "./admin-footage-metadata-form.types";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminFootageMetadataForm(props: AdminFootageMetadataFormProps) {
  const { footage, categories, tags } = props;
  const selectedTags = new Set(footage.tagIds);
  const action = updateAdminFootageMetadataAction.bind(null, footage.id);

  return (
    <form action={action} className="flex flex-col gap-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="titleFa">عنوان</FieldLabel>
          <Input
            id="titleFa"
            name="titleFa"
            required
            defaultValue={footage.titleFa}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="slug">اسلاگ</FieldLabel>
          <Input
            id="slug"
            name="slug"
            required
            defaultValue={footage.slug}
            dir="ltr"
            className="font-mono"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="descriptionFa">توضیح</FieldLabel>
          <Textarea
            id="descriptionFa"
            name="descriptionFa"
            required
            rows={6}
            defaultValue={footage.descriptionFa}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="priceToman">قیمت (تومان)</FieldLabel>
          <Input
            id="priceToman"
            name="priceToman"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            required
            defaultValue={footage.priceToman}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="categoryId">دسته‌بندی</FieldLabel>
          <Select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={footage.categoryId}
          >
            <SelectTrigger className="w-full" aria-label="دسته‌بندی">
              <SelectValue placeholder="انتخاب دسته‌بندی" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nameFa}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      <FieldSet>
        <FieldLegend variant="label">برچسب‌ها</FieldLegend>
        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            برچسبی تعریف نشده است.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tags.map((tag) => (
              <li key={tag.id} className="flex items-center gap-2">
                <Checkbox
                  id={`tag-${tag.id}`}
                  name="tagIds"
                  value={tag.id}
                  defaultChecked={selectedTags.has(tag.id)}
                />
                <FieldLabel htmlFor={`tag-${tag.id}`}>{tag.nameFa}</FieldLabel>
              </li>
            ))}
          </ul>
        )}
      </FieldSet>

      <Button type="submit" className="self-start">
        ذخیره
      </Button>
    </form>
  );
}
