"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  assertDirectStorageUrl,
  uploadFilePartsDirectly,
} from "@/modules/media/browser-multipart-upload";

type AdminFootageUploadPanelProps = {
  footageId: string;
};

type UploadKind = "PREVIEW" | "ORIGINAL";

type InitiateOk = {
  status: "ok";
  upload: {
    uploadId: string;
    footageFileId: string;
    objectKey: string;
    kind: UploadKind;
    label: string;
    sizeBytes: number;
    mimeType: string;
    partSizeBytes: number;
    partCount: number;
    maxUploadBytes: number;
  };
};

type PartOk = {
  status: "ok";
  part: {
    uploadId: string;
    partNumber: number;
    url: string;
    method: "PUT";
    expiresAt: string;
    objectKey: string;
  };
};

type CompleteOk = {
  status: "ok";
  completed: {
    footageFileId: string;
    objectKey: string;
    sizeBytes: number;
    uploadStatus: "READY";
  };
};

async function readJson(response: Response): Promise<unknown> {
  return response.json();
}

/**
 * Minimal operational Admin direct-upload surface.
 * Multipart bytes go to object storage; Next.js only coordinates.
 */
export function AdminFootageUploadPanel({
  footageId,
}: AdminFootageUploadPanelProps) {
  const router = useRouter();
  const [kind, setKind] = useState<UploadKind>("PREVIEW");
  const [label, setLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorText(null);
    setResultText(null);
    setProgressText(null);

    if (file === null) {
      setErrorText("یک فایل انتخاب کنید.");
      return;
    }

    if (kind === "ORIGINAL" && label.trim().length === 0) {
      setErrorText("برای ORIGINAL برچسب لازم است.");
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
      const initiateBody = (await readJson(initiateResponse)) as
        | InitiateOk
        | {
            status: string;
          };

      if (initiateBody.status !== "ok" || !("upload" in initiateBody)) {
        setErrorText(`شروع آپلود ناموفق بود (${initiateBody.status}).`);
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
          const signBody = (await readJson(signResponse)) as
            | PartOk
            | {
                status: string;
              };

          if (signBody.status !== "ok" || !("part" in signBody)) {
            throw new Error(`sign_failed:${signBody.status}`);
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
      const completeBody = (await readJson(completeResponse)) as
        CompleteOk | { status: string };

      if (completeBody.status !== "ok" || !("completed" in completeBody)) {
        setErrorText(`تکمیل آپلود ناموفق بود (${completeBody.status}).`);
        return;
      }

      setResultText(
        `آماده شد: ${completeBody.completed.objectKey} (${completeBody.completed.sizeBytes} بایت)`,
      );
      setProgressText(null);
      setFile(null);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "upload_failed";
      setErrorText(`آپلود متوقف شد (${message}).`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">آپلود مستقیم فایل</h2>
        <p className="text-sm text-muted-foreground">
          فایل بزرگ مستقیماً به فضای ذخیره‌سازی ارسال می‌شود؛ از سرور اپ عبور
          نمی‌کند.
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="upload-kind" className="text-sm font-medium">
            نوع فایل
          </label>
          <select
            id="upload-kind"
            value={kind}
            onChange={(event) => setKind(event.target.value as UploadKind)}
            disabled={busy}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="PREVIEW">PREVIEW</option>
            <option value="ORIGINAL">ORIGINAL</option>
          </select>
        </div>

        {kind === "ORIGINAL" ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="upload-label" className="text-sm font-medium">
              برچسب
            </label>
            <input
              id="upload-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              disabled={busy}
              placeholder="مثلاً 1080p یا Master"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-1">
          <label htmlFor="upload-file" className="text-sm font-medium">
            فایل
          </label>
          <input
            id="upload-file"
            type="file"
            disabled={busy}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-fit rounded-md border border-input bg-background px-4 py-2 text-sm"
        >
          {busy ? "در حال آپلود…" : "شروع آپلود"}
        </button>
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
        <p role="alert" className="text-sm text-destructive">
          {errorText}
        </p>
      ) : null}
    </section>
  );
}
