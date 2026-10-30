import { updateAdminOriginalVariantLabelAction } from "@/modules/media/originals/update-admin-original-variant-label-action";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminFootageOriginalVariantsSectionProps } from "./admin-footage-original-variants-section.types";

function formatTechnicalDetails(
  variant: AdminFootageOriginalVariantsSectionProps["originalVariants"][number],
): string {
  return (
    [
      variant.width && variant.height
        ? `${variant.width}×${variant.height}`
        : null,
      variant.fps ? `${variant.fps} fps` : null,
      variant.codec,
    ]
      .filter((value): value is string => value !== null)
      .join(" · ") || "—"
  );
}

function formatUploadStatus(status: string): string {
  return status === "READY"
    ? `${status} — قابل دانلود`
    : `${status} — غیرقابل استفاده`;
}

export function AdminFootageOriginalVariantsSection(
  props: AdminFootageOriginalVariantsSectionProps,
) {
  const { footageId, originalVariants, saved = false, error = null } = props;

  return (
    <Card>
      <CardHeader>
        <CardTitle>فایل‌های اصلی</CardTitle>
        <CardDescription>
          فقط فایل‌های آماده قابل استفاده برای دانلود هستند. فایل‌های اصلی
          خصوصی‌اند و در این بخش لینک عمومی ندارند.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {saved ? (
          <Alert role="status">
            <AlertDescription>برچسب فایل ذخیره شد.</AlertDescription>
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="destructive" role="alert">
            <AlertDescription>
              ویرایش فایل انجام نشد ({error}).
            </AlertDescription>
          </Alert>
        ) : null}
        {originalVariants.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            فایل اصلی ثبت نشده است.
          </p>
        ) : (
          <Table>
            <TableCaption className="sr-only">فهرست فایل‌های اصلی</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>برچسب</TableHead>
                <TableHead>حجم</TableHead>
                <TableHead>نوع</TableHead>
                <TableHead>مشخصات فنی</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>تاریخ ایجاد</TableHead>
                <TableHead>ویرایش</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {originalVariants.map((variant) => {
                const action = updateAdminOriginalVariantLabelAction.bind(
                  null,
                  footageId,
                  variant.id,
                );
                return (
                  <TableRow key={variant.id}>
                    <TableCell>{variant.label}</TableCell>
                    <TableCell dir="ltr">
                      {variant.sizeBytes.toLocaleString("fa-IR")} بایت
                    </TableCell>
                    <TableCell dir="ltr">{variant.mimeType}</TableCell>
                    <TableCell dir="ltr">
                      {formatTechnicalDetails(variant)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          variant.uploadStatus === "READY"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {formatUploadStatus(variant.uploadStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell dir="ltr">
                      {variant.createdAt.toLocaleDateString("fa-IR")}
                    </TableCell>
                    <TableCell>
                      <form action={action} className="flex gap-2">
                        <Field>
                          <FieldLabel
                            htmlFor={`variant-label-${variant.id}`}
                            className="sr-only"
                          >
                            برچسب {variant.label}
                          </FieldLabel>
                          <Input
                            id={`variant-label-${variant.id}`}
                            name="label"
                            required
                            maxLength={120}
                            defaultValue={variant.label}
                            className="min-w-32"
                          />
                        </Field>
                        <Button type="submit" size="sm" variant="outline">
                          ذخیره
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
