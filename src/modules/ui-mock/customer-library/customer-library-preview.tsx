"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Download,
  FileText,
  LockKeyhole,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTomanDisplay } from "@/modules/footage/format-toman-display";
import { customerInvoiceFixture } from "./fixtures";
import type {
  CustomerDownloadState,
  CustomerFileState,
  CustomerLibraryItem,
  CustomerLibraryScreen,
  CustomerLibraryScenario,
  CustomerPurchaseDetail,
} from "./types";

export type CustomerLibraryScreenProps = {
  screen: CustomerLibraryScreen;
  scenario: CustomerLibraryScenario;
  items: CustomerLibraryItem[];
  detail: CustomerPurchaseDetail | null;
  fileState: CustomerFileState;
};

const dateFormatter = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" });
const formatDate = (value: string) => dateFormatter.format(new Date(value));

function CustomerLibraryChrome({
  screen,
  scenario,
  children,
}: CustomerLibraryScreenProps & { children: React.ReactNode }) {
  const purchaseReference = "PUR-2026-00041";
  const link = (nextScreen: CustomerLibraryScreen) =>
    nextScreen === "library"
      ? `/library?scenario=${scenario}`
      : nextScreen === "detail"
        ? `/library/${purchaseReference}?scenario=${scenario}`
        : `/library/${purchaseReference}/invoice?scenario=${scenario}`;
  const scenarioLink = (nextScenario: CustomerLibraryScenario) =>
    screen === "library"
      ? `/library?scenario=${nextScenario}`
      : screen === "detail"
        ? `/library/${purchaseReference}?scenario=${nextScenario}`
        : `/library/${purchaseReference}/invoice?scenario=${nextScenario}`;
  return (
    <main className="min-h-screen bg-background">
      <div className="border-b bg-card/95">
        <div className="container-storefront flex flex-wrap items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-heading font-semibold">
              کتابخانه مشتری Vidora
            </span>
            <Badge variant="outline">پیش‌نمایش fixture</Badge>
          </div>
        </div>
      </div>
      <div className="container-storefront py-8 md:py-12">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-primary">
              Minimal · مسیر کوتاه و روشن برای پیدا کردن خریدها
            </p>
            <h1 className="text-3xl leading-10 font-bold">کتابخانه مشتری</h1>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="صفحه‌های کتابخانه">
            {(["library", "detail", "invoice"] as const).map((item) => (
              <Link
                key={item}
                href={link(item)}
                className={`rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring ${item === screen ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}
              >
                {item === "library"
                  ? "کتابخانه"
                  : item === "detail"
                    ? "جزئیات خرید"
                    : "فاکتور"}
              </Link>
            ))}
          </nav>
        </header>
        <div className="mb-6 rounded-lg border border-dashed bg-muted/40 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold">سناریوی fixture:</span>
            {(
              [
                "populated",
                "one-purchase",
                "empty",
                "loading",
                "error",
                "unauthenticated",
              ] as const
            ).map((item) => (
              <Link
                key={item}
                href={scenarioLink(item)}
                className={`rounded-md px-2.5 py-1 text-xs focus-visible:outline-2 focus-visible:outline-ring ${item === scenario ? "bg-foreground text-background" : "bg-background hover:bg-card"}`}
              >
                {item}
              </Link>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            این داده‌ها خرید واقعی، نشست واقعی یا مجوز دانلود ایجاد نمی‌کنند.
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}

function StatePanel({ scenario }: { scenario: CustomerLibraryScenario }) {
  if (scenario === "loading")
    return (
      <div className="grid gap-4 md:grid-cols-3" aria-label="در حال بارگذاری">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    );
  if (scenario === "error")
    return (
      <Alert variant="destructive">
        <AlertTitle>بارگذاری کتابخانه ناموفق بود</AlertTitle>
        <AlertDescription>
          خطای موقت در این پیش‌نمایش شبیه‌سازی شده است. سناریوی دیگری را انتخاب
          کنید.
        </AlertDescription>
      </Alert>
    );
  if (scenario === "unauthenticated")
    return (
      <Alert>
        <LockKeyhole aria-hidden="true" />
        <AlertTitle>ورود به حساب لازم است</AlertTitle>
        <AlertDescription>
          این مسیر فقط نمایشی است و ورود واقعی انجام نمی‌دهد. برای ادامه به{" "}
          <Link
            className="font-medium text-primary underline"
            href="/login?returnTo=%2Flibrary"
          >
            صفحه ورود
          </Link>{" "}
          بروید.
        </AlertDescription>
      </Alert>
    );
  return null;
}

function LibraryScreen({ scenario, items }: CustomerLibraryScreenProps) {
  if (
    scenario === "loading" ||
    scenario === "error" ||
    scenario === "unauthenticated"
  ) {
    return <StatePanel scenario={scenario} />;
  }
  if (scenario === "empty" || items.length === 0)
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <FileText aria-hidden="true" className="text-muted-foreground" />
          <h2 className="text-xl font-semibold">کتابخانه شما هنوز خالی است</h2>
          <p className="max-w-md text-muted-foreground">
            پس از خرید یک فوتیج، خریدهای شما در اینجا نمایش داده می‌شوند.
          </p>
          <Button nativeButton={false} render={<Link href="/" />}>
            مشاهده فوتیج‌ها
          </Button>
        </CardContent>
      </Card>
    );
  return (
    <section aria-labelledby="library-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="library-heading" className="text-xl font-semibold">
          فوتیج‌های خریداری‌شده
        </h2>
        <Badge variant="secondary">{items.length} خرید</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <article
            key={item.footageId}
            className="group overflow-hidden rounded-lg border bg-card/80"
          >
            <Link
              href={`/library/${item.purchaseReference}?scenario=${scenario}`}
              className="block rounded-t-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={`مشاهده جزئیات خرید ${item.titleFa}`}
            >
              <Image
                src={item.coverSrc}
                alt={item.coverAltFa}
                width={800}
                height={450}
                unoptimized
                className="aspect-video w-full object-cover transition-transform group-hover:scale-[1.02] motion-reduce:transition-none"
              />
              <div className="p-2.5 pb-1">
                <h3 className="line-clamp-2 text-sm leading-5 font-semibold">
                  {item.titleFa}
                </h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  خرید در {formatDate(item.purchasedAt)}
                </p>
              </div>
            </Link>
            <div className="px-2.5 pb-2.5">
              <Button
                nativeButton={false}
                size="xs"
                variant="outline"
                render={
                  <Link
                    href={`/library/${item.purchaseReference}?scenario=${scenario}`}
                    aria-label={`باز کردن دانلودهای ${item.titleFa}`}
                  />
                }
              >
                جزئیات و دانلودها
                <ArrowLeft data-icon="inline-end" aria-hidden="true" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DownloadButton({
  label,
  state,
  onDownload,
}: {
  label: string;
  state: CustomerDownloadState;
  onDownload: () => void;
}) {
  const text =
    state === "pending"
      ? "در حال بررسی…"
      : state === "success"
        ? "درخواست شبیه‌سازی شد"
        : state === "denied"
          ? "دسترسی مجاز نیست"
          : `درخواست دانلود ${label}`;
  return (
    <Button
      type="button"
      size="sm"
      variant={
        state === "denied"
          ? "destructive"
          : state === "success"
            ? "secondary"
            : "default"
      }
      disabled={
        state === "pending" || state === "success" || state === "denied"
      }
      onClick={onDownload}
    >
      <Download data-icon="inline-start" aria-hidden="true" />
      {text}
    </Button>
  );
}

function DetailScreen({
  scenario,
  detail,
  fileState,
}: CustomerLibraryScreenProps) {
  const [downloadStates, setDownloadStates] = useState<
    Record<string, CustomerDownloadState>
  >({});
  if (
    scenario === "loading" ||
    scenario === "error" ||
    scenario === "unauthenticated"
  )
    return <StatePanel scenario={scenario} />;
  if (fileState === "access-denied")
    return (
      <Alert variant="destructive">
        <LockKeyhole aria-hidden="true" />
        <AlertTitle>دسترسی به خرید تأیید نشد</AlertTitle>
        <AlertDescription>
          این وضعیت نمایشی است؛ هیچ entitlement یا فایل اصلی صادر نشده است.
        </AlertDescription>
      </Alert>
    );
  if (fileState === "not-found" || !detail)
    return (
      <Alert variant="destructive">
        <AlertTitle>خرید پیدا نشد</AlertTitle>
        <AlertDescription>
          جزئیات خرید در این fixture وجود ندارد.
        </AlertDescription>
      </Alert>
    );
  const files =
    fileState === "unavailable"
      ? detail.files.map((file) => ({ ...file, state: "unavailable" as const }))
      : detail.files;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <Image
          src={detail.coverSrc}
          alt={detail.coverAltFa}
          width={800}
          height={450}
          unoptimized
          className="aspect-video w-full object-cover"
        />
        <CardHeader>
          <Badge variant="secondary" className="mb-2 w-fit">
            خرید تأییدشده در fixture
          </Badge>
          <CardTitle className="text-xl leading-8">{detail.titleFa}</CardTitle>
          <CardDescription>
            مرجع خرید: <span dir="ltr">{detail.purchaseReference}</span> ·{" "}
            {formatDate(detail.purchasedAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold" dir="ltr">
            {formatTomanDisplay(detail.priceToman)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            قیمت از fixture معتبر انتخاب شده است؛ کنترل دانلود در این صفحه
            عملیاتی نیست.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>کیفیت‌های موجود</CardTitle>
          <CardDescription>
            فرمت و ابعاد هر فایل بدون نمایش URL یا کلید ذخیره‌سازی.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {files.map((file) => (
            <div key={file.label} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{file.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.format} · {file.dimensions}
                  </p>
                </div>
                {file.state === "available" ? (
                  <DownloadButton
                    label={file.label}
                    state={downloadStates[file.label] ?? "idle"}
                    onDownload={() => {
                      setDownloadStates((current) => ({
                        ...current,
                        [file.label]: "pending",
                      }));
                      window.setTimeout(
                        () =>
                          setDownloadStates((current) => ({
                            ...current,
                            [file.label]: "success",
                          })),
                        500,
                      );
                    }}
                  />
                ) : (
                  <Badge variant="outline">فعلاً موجود نیست</Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex-wrap gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            render={
              <Link
                href={`/library/${detail.purchaseReference}/invoice?scenario=${scenario}`}
              />
            }
          >
            مشاهده فاکتور{" "}
            <ArrowLeft data-icon="inline-end" aria-hidden="true" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function InvoiceScreen({ scenario, detail }: CustomerLibraryScreenProps) {
  if (scenario === "loading")
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 py-8">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-1/2" />
        </CardContent>
      </Card>
    );
  if (scenario === "error")
    return (
      <Alert variant="destructive">
        <AlertTitle>نمایش فاکتور ناموفق بود</AlertTitle>
        <AlertDescription>
          فاکتور در این سناریو قابل دریافت نیست.
        </AlertDescription>
      </Alert>
    );
  if (scenario === "unauthenticated") return <StatePanel scenario={scenario} />;
  if (scenario === "empty")
    return (
      <Alert>
        <AlertTitle>فاکتوری برای نمایش وجود ندارد</AlertTitle>
        <AlertDescription>
          برای این سناریو سابقه خریدی ثبت نشده است.
        </AlertDescription>
      </Alert>
    );
  if (!detail)
    return (
      <Alert variant="destructive">
        <AlertTitle>فاکتور پیدا نشد</AlertTitle>
        <AlertDescription>
          فاکتور این خرید در این fixture وجود ندارد.
        </AlertDescription>
      </Alert>
    );
  const invoice = customerInvoiceFixture;
  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Vidora</p>
            <CardTitle className="text-2xl">رسید خرید نمایشی</CardTitle>
          </div>
          <Badge variant="outline">فقط fixture</Badge>
        </div>
        <CardDescription>
          این صفحه فاکتور رسمی صادر نمی‌کند. شماره مالیاتی، آدرس حقوقی و سایر
          فیلدهای رسمی هنوز در محصول تعریف نشده‌اند.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-4 rounded-lg bg-muted/50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">مرجع سفارش</p>
            <p className="font-medium" dir="ltr">
              {invoice.orderReference}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">مرجع خرید</p>
            <p className="font-medium" dir="ltr">
              {invoice.purchaseReference}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">تاریخ خرید</p>
            <p className="font-medium">{formatDate(invoice.purchasedAt)}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>فوتیج</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="text-end">مبلغ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="min-w-52 font-medium">
                  {invoice.titleSnapshotFa}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    <Check data-icon="inline-start" aria-hidden="true" />
                    پرداخت تأییدشده
                  </Badge>
                </TableCell>
                <TableCell className="text-end" dir="ltr">
                  {formatTomanDisplay(invoice.amountToman)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-lg font-bold">
          <span>مجموع</span>
          <span dir="ltr">{formatTomanDisplay(invoice.amountToman)}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          اطلاعات مشتری: <span dir="ltr">{invoice.maskedPhone}</span>
        </p>
      </CardContent>
    </Card>
  );
}

export function CustomerLibraryScreen(props: CustomerLibraryScreenProps) {
  return (
    <CustomerLibraryChrome {...props}>
      {props.screen === "library" ? (
        <LibraryScreen {...props} />
      ) : props.screen === "detail" ? (
        <DetailScreen {...props} />
      ) : (
        <InvoiceScreen {...props} />
      )}
    </CustomerLibraryChrome>
  );
}
