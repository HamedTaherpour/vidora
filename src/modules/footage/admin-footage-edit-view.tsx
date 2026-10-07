import type { AdminFootageRecord } from "@/modules/footage/admin-footage-store";
import type { AdminClassificationOption } from "@/modules/footage/load-admin-footage-edit";
import { updateAdminFootageMetadataAction } from "@/modules/footage/update-admin-footage-metadata-action";

type AdminFootageEditViewProps = {
  footage: AdminFootageRecord;
  categories: AdminClassificationOption[];
  tags: AdminClassificationOption[];
  saved?: boolean;
  error?: string | null;
};

/**
 * Minimal operational Admin Footage editor.
 * Supports CAT-03 editable fields only. No media or bulk lifecycle UI.
 */
export function AdminFootageEditView({
  footage,
  categories,
  tags,
  saved = false,
  error = null,
}: AdminFootageEditViewProps) {
  const selectedTags = new Set(footage.tagIds);
  const action = updateAdminFootageMetadataAction.bind(null, footage.id);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <p>
          <a href="/admin/footage" className="text-sm underline">
            بازگشت به فهرست
          </a>
        </p>
        <h1 className="text-2xl font-semibold">ویرایش فوتیج</h1>
        <p className="text-sm text-muted-foreground">
          وضعیت انتشار:{" "}
          {footage.status === "PUBLISHED" ? "منتشر شده" : "پیش‌نویس"}
          <span className="sr-only"> ({footage.status})</span>
        </p>
      </header>

      {saved ? (
        <p role="status" className="text-sm">
          تغییرات ذخیره شد.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          ذخیره انجام نشد ({error}).
        </p>
      ) : null}

      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="titleFa" className="text-sm font-medium">
            عنوان
          </label>
          <input
            id="titleFa"
            name="titleFa"
            required
            defaultValue={footage.titleFa}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="slug" className="text-sm font-medium">
            اسلاگ
          </label>
          <input
            id="slug"
            name="slug"
            required
            defaultValue={footage.slug}
            className="rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="descriptionFa" className="text-sm font-medium">
            توضیح
          </label>
          <textarea
            id="descriptionFa"
            name="descriptionFa"
            required
            rows={6}
            defaultValue={footage.descriptionFa}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="priceToman" className="text-sm font-medium">
            قیمت (تومان)
          </label>
          <input
            id="priceToman"
            name="priceToman"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            required
            defaultValue={footage.priceToman}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="categoryId" className="text-sm font-medium">
            دسته‌بندی
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={footage.categoryId}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nameFa}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">برچسب‌ها</legend>
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              برچسبی تعریف نشده است.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {tags.map((tag) => (
                <li key={tag.id} className="flex items-center gap-2">
                  <input
                    id={`tag-${tag.id}`}
                    name="tagIds"
                    type="checkbox"
                    value={tag.id}
                    defaultChecked={selectedTags.has(tag.id)}
                  />
                  <label htmlFor={`tag-${tag.id}`} className="text-sm">
                    {tag.nameFa}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        <button
          type="submit"
          className="self-start rounded-md border border-border bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          ذخیره
        </button>
      </form>
    </div>
  );
}
