import { updateAdminFootageMetadataAction } from "@/modules/footage/admin/edit/update-admin-footage-metadata-action";
import { AdminFootageUploadPanel } from "@/modules/media/uploads/components/admin-footage-upload-panel";
import { AdminFootageCoverPanel } from "@/modules/media/covers/components/admin-footage-cover-panel";
import { updateAdminOriginalVariantLabelAction } from "@/modules/media/originals/update-admin-original-variant-label-action";
import type { AdminFootageEditViewProps } from "./admin-footage-edit-view.types";

/**
 * Minimal operational Admin Footage editor.
 * CAT-03 metadata fields plus the MEDIA-03 direct-upload panel.
 */
export function AdminFootageEditView(props: AdminFootageEditViewProps) {
  const {
    footage,
    preview,
    categories,
    tags,
    originalVariants,
    saved = false,
    error = null,
    variantSaved = false,
    variantError = null,
  } = props;
  const selectedTags = new Set(footage.tagIds);
  const action = updateAdminFootageMetadataAction.bind(null, footage.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 py-6">
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
            dir="ltr"
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

      <AdminFootageCoverPanel footageId={footage.id} />

      <AdminFootageUploadPanel footageId={footage.id} />

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">فایل‌های اصلی</h2>
        <p className="text-sm text-muted-foreground">
          فقط فایل‌های آماده قابل استفاده برای دانلود هستند. فایل‌های اصلی
          خصوصی‌اند و در این بخش لینک عمومی ندارند.
        </p>
        {variantSaved ? (
          <p role="status" className="text-sm">
            برچسب فایل ذخیره شد.
          </p>
        ) : null}
        {variantError ? (
          <p role="alert" className="text-sm text-destructive">
            ویرایش فایل انجام نشد ({variantError}).
          </p>
        ) : null}
        {originalVariants.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            فایل اصلی ثبت نشده است.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <caption className="sr-only">فهرست فایل‌های اصلی</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="p-2">
                    برچسب
                  </th>
                  <th scope="col" className="p-2">
                    حجم
                  </th>
                  <th scope="col" className="p-2">
                    نوع
                  </th>
                  <th scope="col" className="p-2">
                    مشخصات فنی
                  </th>
                  <th scope="col" className="p-2">
                    وضعیت
                  </th>
                  <th scope="col" className="p-2">
                    تاریخ ایجاد
                  </th>
                  <th scope="col" className="p-2">
                    ویرایش
                  </th>
                </tr>
              </thead>
              <tbody>
                {originalVariants.map((variant) => {
                  const action = updateAdminOriginalVariantLabelAction.bind(
                    null,
                    footage.id,
                    variant.id,
                  );
                  return (
                    <tr key={variant.id} className="border-b border-border">
                      <td className="p-2">{variant.label}</td>
                      <td className="p-2" dir="ltr">
                        {variant.sizeBytes.toLocaleString("fa-IR")} بایت
                      </td>
                      <td className="p-2" dir="ltr">
                        {variant.mimeType}
                      </td>
                      <td className="p-2" dir="ltr">
                        {[
                          variant.width && variant.height
                            ? `${variant.width}×${variant.height}`
                            : null,
                          variant.fps ? `${variant.fps} fps` : null,
                          variant.codec,
                        ]
                          .filter((value): value is string => value !== null)
                          .join(" · ") || "—"}
                      </td>
                      <td className="p-2">
                        {variant.uploadStatus}
                        {variant.uploadStatus === "READY"
                          ? " — قابل دانلود"
                          : " — غیرقابل استفاده"}
                      </td>
                      <td className="p-2" dir="ltr">
                        {variant.createdAt.toLocaleDateString("fa-IR")}
                      </td>
                      <td className="p-2">
                        <form action={action} className="flex gap-2">
                          <label
                            htmlFor={`variant-label-${variant.id}`}
                            className="sr-only"
                          >
                            برچسب {variant.label}
                          </label>
                          <input
                            id={`variant-label-${variant.id}`}
                            name="label"
                            required
                            maxLength={120}
                            defaultValue={variant.label}
                            className="min-w-32 rounded-md border border-input bg-background px-2 py-1"
                          />
                          <button
                            type="submit"
                            className="rounded-md border border-input px-2 py-1"
                          >
                            ذخیره
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">پیش‌نمایش</h2>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>وجود فایل</dt>
            <dd>{preview.exists ? "دارد" : "ندارد"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>وضعیت آپلود</dt>
            <dd>{preview.uploadStatus ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>قابل انتشار</dt>
            <dd>{preview.isReady ? "بله" : "خیر"}</dd>
          </div>
        </dl>
        {footage.status === "PUBLISHED" && preview.isReady ? (
          <div className="flex gap-3 text-sm">
            <a
              href={`/api/footage/${footage.id}/preview?mode=stream`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              پخش پیش‌نمایش
            </a>
            <a
              href={`/api/footage/${footage.id}/preview?mode=download`}
              className="underline"
            >
              دانلود پیش‌نمایش
            </a>
          </div>
        ) : null}
      </section>
    </div>
  );
}
