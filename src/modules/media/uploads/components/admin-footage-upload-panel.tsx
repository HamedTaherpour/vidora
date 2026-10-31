"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import {
  assertDirectStorageUrl,
  uploadFilePartsDirectly,
} from "@/modules/media/uploads/browser-multipart-upload";
import {
  parseCompleteUploadResponse,
  parseInitiateUploadResponse,
  parseSignPartResponse,
  parseUploadKind,
  UploadPanelError,
  type UploadKind,
  uploadFailureMessage,
} from "./admin-footage-upload-panel-helpers";
import type { AdminFootageUploadPanelProps } from "./admin-footage-upload-panel.types";

async function readJson(response: Response): Promise<unknown> {
  return response.json();
}

/**
 * Minimal operational Admin direct-upload surface.
 * Multipart bytes go to object storage; Next.js only coordinates.
 */
export function AdminFootageUploadPanel(props: AdminFootageUploadPanelProps) {
  const { footageId } = props;
  const router = useRouter();
  const [kind, setKind] = useState<UploadKind>("PREVIEW");
  const [label, setLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorText(null);
    setResultText(null);
    setProgressText(null);

    if (file === null) {
      setErrorText("یک فایل انتخاب کنید.");
      return;
    }

    if (kind === "ORIGINAL" && label.trim().length === 0) {
      setErrorText("برای فایل اصلی برچسب لازم است.");
      return;
    }

    setBusy(true);

    try {
      const initiateResponse = await fetch("/api/admin/media/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          footageId,
          kind,
          label: kind === "ORIGINAL" ? label.trim() : undefined,
          sizeBytes: file.size,
          mimeType: file.type || "application/octet-stream",
          fileName: file.name,
        }),
      });
      const initiateBody = parseInitiateUploadResponse(
        await readJson(initiateResponse),
      );

      if (initiateBody.status !== "ok") {
        setErrorText(uploadFailureMessage(initiateBody.status, "initiate"));
        return;
      }

      const session = initiateBody.upload;
      setProgressText(`آپلود آغاز شد — ${session.partCount} بخش`);

      const parts = await uploadFilePartsDirectly({
        file,
        partSizeBytes: session.partSizeBytes,
        partCount: session.partCount,
        maxPartAttempts: 3,
        signPart: async (partNumber) => {
          const signResponse = await fetch(
            `/api/admin/media/uploads/${session.uploadId}/parts`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ partNumber }),
            },
          );
          const signBody = parseSignPartResponse(await readJson(signResponse));

          if (signBody.status !== "ok") {
            throw new UploadPanelError(
              uploadFailureMessage(signBody.status, "sign"),
            );
          }

          assertDirectStorageUrl(signBody.part.url, window.location.origin);

          return {
            url: signBody.part.url,
            method: signBody.part.method,
          };
        },
        onProgress: ({
          completedParts,
          partCount,
          uploadedBytes,
          totalBytes,
        }) => {
          const percent = Math.floor((uploadedBytes / totalBytes) * 100);
          setProgressText(`بخش ${completedParts}/${partCount} — ${percent}%`);
        },
      });

      const completeResponse = await fetch(
        `/api/admin/media/uploads/${session.uploadId}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parts }),
        },
      );
      const completeBody = parseCompleteUploadResponse(
        await readJson(completeResponse),
      );

      if (completeBody.status !== "ok") {
        setErrorText(uploadFailureMessage(completeBody.status, "complete"));
        return;
      }

      setResultText(
        `آپلود با موفقیت آماده شد (${completeBody.completed.sizeBytes} بایت).`,
      );
      setProgressText(null);
      setFile(null);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof UploadPanelError
          ? error.userMessage
          : uploadFailureMessage("unknown", "upload");
      setErrorText(message);
    } finally {
      setBusy(false);
    }
  }

  function handleUploadKindChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextKind = parseUploadKind(event.target.value);

    if (nextKind === null) {
      setErrorText("نوع فایل انتخاب‌شده معتبر نیست.");
      return;
    }

    setErrorText(null);
    setKind(nextKind);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>آپلود مستقیم فایل</CardTitle>
        <CardDescription>
          فایل بزرگ مستقیماً به فضای ذخیره‌سازی ارسال می‌شود؛ از سرور اپ عبور
          نمی‌کند.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="upload-kind">نوع فایل</FieldLabel>
              <select
                id="upload-kind"
                value={kind}
                onChange={handleUploadKindChange}
                disabled={busy}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="PREVIEW">پیش‌نمایش</option>
                <option value="ORIGINAL">فایل اصلی</option>
              </select>
            </Field>

            {kind === "ORIGINAL" ? (
              <Field>
                <FieldLabel htmlFor="upload-label">برچسب</FieldLabel>
                <Input
                  id="upload-label"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  disabled={busy}
                  placeholder="مثلاً 1080p یا Master"
                />
              </Field>
            ) : null}

            <Field>
              <FieldLabel htmlFor="upload-file">فایل</FieldLabel>
              <Input
                id="upload-file"
                type="file"
                disabled={busy}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            disabled={busy}
            variant="outline"
            className="w-fit"
          >
            {busy ? "در حال آپلود…" : "شروع آپلود"}
          </Button>
        </form>

        {progressText ? (
          <p role="status" className="text-sm">
            {progressText}
          </p>
        ) : null}

        {resultText ? (
          <p role="status" className="text-sm">
            {resultText}
          </p>
        ) : null}

        {errorText ? (
          <Alert variant="destructive">
            <AlertDescription>{errorText}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
