"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import {
  COVER_HEIGHT,
  COVER_MAX_BYTES,
  COVER_OUTPUT_MIME_TYPE,
  COVER_SOURCE_MAX_BYTES,
  COVER_SOURCE_MIME_TYPES,
} from "@/modules/media/covers/cover-policy";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { AdminFootageCoverPanelProps } from "./admin-footage-cover-panel.types";

const COVER_WIDTH = 1280;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function readJson(value: unknown): { status?: string } {
  return typeof value === "object" && value !== null
    ? (value as { status?: string })
    : {};
}

async function canvasBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("canvas_failed"))),
      COVER_OUTPUT_MIME_TYPE,
      quality,
    );
  });
}

export function AdminFootageCoverPanel(props: AdminFootageCoverPanelProps) {
  const { footageId } = props;
  const router = useRouter();
  const imageRef = useRef<HTMLImageElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (sourceUrl !== null) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  function handleFileChange(file: File | undefined) {
    setError(null);
    setMessage(null);

    if (!file) return;
    if (
      !COVER_SOURCE_MIME_TYPES.includes(
        file.type as (typeof COVER_SOURCE_MIME_TYPES)[number],
      )
    ) {
      setError("فرمت تصویر باید JPEG، PNG یا WebP باشد.");
      return;
    }
    if (file.size > COVER_SOURCE_MAX_BYTES) {
      setError("حجم تصویر اولیه نباید بیشتر از ۲۰ مگابایت باشد.");
      return;
    }

    if (sourceUrl !== null) URL.revokeObjectURL(sourceUrl);
    setSourceFile(file);
    setSourceUrl(URL.createObjectURL(file));
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  }

  function clearSource() {
    setSourceFile(null);
    setSourceUrl(null);
  }

  function handlePointerDown(event: PointerEvent<HTMLImageElement>) {
    if (!viewportRef.current) return;
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLImageElement>) {
    const drag = dragRef.current;
    const viewport = viewportRef.current;
    if (!drag || !viewport || drag.pointerId !== event.pointerId) return;

    const maxX = ((zoom - 1) * viewport.clientWidth) / 2;
    const maxY = ((zoom - 1) * viewport.clientHeight) / 2;
    setOffset({
      x: clamp(drag.offsetX + event.clientX - drag.x, -maxX, maxX),
      y: clamp(drag.offsetY + event.clientY - drag.y, -maxY, maxY),
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLImageElement>) {
    const step = event.shiftKey ? 24 : 8;
    if (event.key === "ArrowLeft")
      setOffset((value) => ({ ...value, x: value.x - step }));
    if (event.key === "ArrowRight")
      setOffset((value) => ({ ...value, x: value.x + step }));
    if (event.key === "ArrowUp")
      setOffset((value) => ({ ...value, y: value.y - step }));
    if (event.key === "ArrowDown")
      setOffset((value) => ({ ...value, y: value.y + step }));
  }

  async function createCroppedFile(): Promise<File> {
    const image = imageRef.current;
    const viewport = viewportRef.current;
    if (!image || !viewport || !sourceFile || image.naturalWidth < 1) {
      throw new Error("image_not_ready");
    }

    const canvas = document.createElement("canvas");
    canvas.width = COVER_WIDTH;
    canvas.height = COVER_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas_failed");

    const coverScale = Math.max(
      viewport.clientWidth / image.naturalWidth,
      viewport.clientHeight / image.naturalHeight,
    );
    const scale = coverScale * zoom;
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const ratio = COVER_WIDTH / viewport.clientWidth;
    context.drawImage(
      image,
      (COVER_WIDTH - width * ratio) / 2 + offset.x * ratio,
      (COVER_HEIGHT - height * ratio) / 2 + offset.y * ratio,
      width * ratio,
      height * ratio,
    );

    let blob = await canvasBlob(canvas, 0.9);
    for (const quality of [0.8, 0.7, 0.6, 0.5]) {
      if (blob.size <= COVER_MAX_BYTES) break;
      blob = await canvasBlob(canvas, quality);
    }
    if (blob.size > COVER_MAX_BYTES) throw new Error("cover_too_large");
    return new File([blob], "cover.jpg", { type: COVER_OUTPUT_MIME_TYPE });
  }

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const file = await createCroppedFile();
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch(`/api/admin/footage/${footageId}/cover`, {
        method: "POST",
        body: formData,
      });
      const result = readJson(await response.json());
      if (!response.ok || result.status !== "ok") {
        setError(
          result.status === "invalid_cover"
            ? "خروجی برش‌خورده معتبر نیست. دوباره تلاش کنید."
            : "ذخیره جلد انجام نشد. جلد قبلی فعال باقی می‌ماند.",
        );
        return;
      }
      setMessage("جلد با موفقیت ذخیره شد.");
      clearSource();
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error && error.message === "cover_too_large"
          ? "حجم خروجی برش‌خورده باید حداکثر ۲ مگابایت باشد."
          : "برش یا ذخیره جلد انجام نشد. جلد قبلی فعال باقی می‌ماند.",
      );
    } finally {
      setBusy(false);
    }
  }

  const imageStyle = {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>جلد فوتیج</CardTitle>
        <CardDescription>
          تصویر اولیه به JPEG با اندازه ۱۲۸۰×۷۲۰ و نسبت ثابت ۱۶:۹ تبدیل می‌شود.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex aspect-video w-full max-w-2xl items-center justify-center overflow-hidden rounded-md bg-muted">
          <img
            src={`/api/admin/footage/${footageId}/cover`}
            alt="جلد فعلی فوتیج"
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>

        <Field>
          <FieldLabel htmlFor="cover-file">انتخاب تصویر جدید</FieldLabel>
          <Input
            id="cover-file"
            type="file"
            accept={COVER_SOURCE_MIME_TYPES.join(",")}
            disabled={busy}
            onChange={(event) => handleFileChange(event.target.files?.[0])}
          />
        </Field>

        <Dialog
          open={sourceUrl !== null}
          onOpenChange={(open) => {
            if (!open && !busy) clearSource();
          }}
        >
          <DialogContent
            ref={viewportRef}
            showCloseButton={false}
            className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-md border-2 border-primary bg-black p-0"
          >
            <DialogTitle className="sr-only">برش جلد فوتیج</DialogTitle>
            <img
              ref={imageRef}
              src={sourceUrl ?? ""}
              alt="پیش‌نمایش تصویر برای برش"
              className="h-full w-full cursor-move object-cover outline-none"
              style={imageStyle}
              tabIndex={0}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={() => {
                dragRef.current = null;
              }}
              onKeyDown={handleKeyDown}
            />
            <div className="pointer-events-none absolute inset-0 border-2 border-white/80" />
            <p className="absolute bottom-2 start-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
              برای جابه‌جایی بکشید؛ با کلیدهای جهت‌دار نیز قابل کنترل است.
            </p>
          </DialogContent>
        </Dialog>

        {sourceUrl ? (
          <div className="flex max-w-2xl flex-col gap-3">
            <label htmlFor="cover-zoom" className="text-sm font-medium">
              بزرگ‌نمایی
            </label>
            <input
              id="cover-zoom"
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              disabled={busy}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={busy}
              >
                {busy ? "در حال ذخیره…" : "تأیید و ذخیره جلد"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  clearSource();
                }}
                disabled={busy}
                variant="outline"
              >
                انصراف
              </Button>
            </div>
          </div>
        ) : null}

        {message ? <p role="status">{message}</p> : null}
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
