import type { AdminFootagePreviewSectionProps } from "./admin-footage-preview-section.types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminFootagePreviewSection(
  props: AdminFootagePreviewSectionProps,
) {
  const { footageId, status, preview } = props;

  return (
    <Card>
      <CardHeader>
        <CardTitle>پیش‌نمایش</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>وجود فایل</dt>
            <dd>
              <Badge variant={preview.exists ? "secondary" : "outline"}>
                {preview.exists ? "دارد" : "ندارد"}
              </Badge>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>وضعیت آپلود</dt>
            <dd>
              <Badge variant="outline">{preview.uploadStatus ?? "—"}</Badge>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>قابل انتشار</dt>
            <dd>
              <Badge variant={preview.isReady ? "secondary" : "outline"}>
                {preview.isReady ? "بله" : "خیر"}
              </Badge>
            </dd>
          </div>
        </dl>
        {status === "PUBLISHED" && preview.isReady ? (
          <div className="flex gap-3 text-sm">
            <a
              href={`/api/footage/${footageId}/preview?mode=stream`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              پخش پیش‌نمایش
            </a>
            <a
              href={`/api/footage/${footageId}/preview?mode=download`}
              className="underline"
            >
              دانلود پیش‌نمایش
            </a>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
