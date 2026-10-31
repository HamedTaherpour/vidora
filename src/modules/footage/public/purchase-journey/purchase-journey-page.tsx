"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatTomanDisplay } from "@/modules/footage/format-toman-display";
import type {
  PurchaseJourneyProps,
  PurchaseJourneyState,
  PurchaseSnapshot,
} from "./purchase-journey.types";

export function PurchaseJourneyPage(props: PurchaseJourneyProps) {
  const { footage, initialState, authenticated } = props;
  const [state, setState] = useState<PurchaseJourneyState>(initialState);
  const [busy, setBusy] = useState(initialState === "initiating");
  const snapshot = useMemo<PurchaseSnapshot>(
    () => ({
      id: footage.id,
      slug: footage.slug,
      titleFa: footage.titleFa,
      priceToman: footage.priceToman,
      qualities: footage.qualities,
      category: footage.category,
      cover:
        footage.cover.status === "ready"
          ? footage.cover
          : { status: "ready" as const, src: "", altFa: footage.cover.altFa },
    }),
    [footage],
  );

  useEffect(() => {
    if (initialState !== "initiating") return;
    const timer = window.setTimeout(() => {
      setBusy(false);
      setState("pending");
    }, 900);
    return () => window.clearTimeout(timer);
  }, [initialState]);

  function startPayment() {
    setBusy(true);
    setState("initiating");
    window.setTimeout(() => {
      setBusy(false);
      setState("pending");
    }, 900);
  }

  function reset() {
    setBusy(false);
    setState("review");
  }

  const footageHref = `/footage/${snapshot.slug}`;
  const purchaseHref = `/purchase/${snapshot.slug}`;
  const returnTo = `${purchaseHref}?customer=authenticated`;

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6 rounded-2xl bg-muted/20 p-4 sm:p-6 md:p-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">خرید فوتیج</Badge>
            <Badge variant={authenticated ? "default" : "secondary"}>
              {authenticated ? "کاربر واردشده" : "مهمان"}
            </Badge>
          </div>
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href={footageHref}
          >
            بازگشت به فوتیج
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">پرداخت شبیه‌سازی‌شده</p>
          <h1 className="max-w-3xl text-2xl leading-tight font-bold tracking-tight sm:text-4xl">
            قبل از پرداخت، انتخاب‌تان را با اطمینان مرور کنید
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            این محیط برای بررسی تجربه خرید است. هیچ سفارش واقعی، پرداخت واقعی،
            فاکتور یا دسترسی دانلودی ایجاد نمی‌شود.
          </p>
        </div>
      </header>

      <CommercePurchaseLayout
        footage={snapshot}
        state={state}
        authenticated={authenticated}
        busy={busy}
        onStart={startPayment}
        onReset={reset}
        footageHref={footageHref}
        purchaseHref={purchaseHref}
        returnTo={returnTo}
      />
    </section>
  );
}

type JourneyViewProps = {
  footage: PurchaseSnapshot;
  state: PurchaseJourneyState;
  authenticated: boolean;
  busy: boolean;
  onStart: () => void;
  onReset: () => void;
  footageHref: string;
  purchaseHref: string;
  returnTo: string;
};

function CommercePurchaseLayout(props: JourneyViewProps) {
  return (
    <div className="grid min-w-0 gap-6 lg:col-span-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:items-start">
      <Card className="min-w-0 self-start">
        <CardHeader>
          <CardTitle>بررسی سفارش</CardTitle>
          <CardDescription>
            یک فوتیج، یک قیمت معتبر، بدون سبد خرید.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-5">
          <SnapshotLine footage={props.footage} />
          <Separator />
          <dl className="grid min-w-0 gap-4 text-sm sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-muted-foreground">کیفیت‌های قابل ارائه</dt>
              <dd className="mt-1 font-medium">
                {props.footage.qualities.join("، ")}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-muted-foreground">نوع خرید</dt>
              <dd className="mt-1 font-medium">خرید تکی</dd>
            </div>
          </dl>
          <InfoAlert />
        </CardContent>
      </Card>
      <Card className="min-w-0 self-start">
        <CardHeader>
          <CardTitle>مبلغ پرداخت</CardTitle>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-5">
          <div>
            <p className="text-sm text-muted-foreground">قیمت نهایی</p>
            <p className="text-3xl font-bold tabular-nums">
              {formatTomanDisplay(props.footage.priceToman)}
            </p>
          </div>
          <Status {...props} />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoAlert() {
  return (
    <Alert className="min-w-0">
      <div className="flex min-w-0 items-start gap-2">
        <span className="mt-0.5 shrink-0" aria-hidden="true">
          <ShieldCheck />
        </span>
        <AlertTitle className="min-w-0 flex-1">انتظار فاکتور رسمی</AlertTitle>
      </div>
      <AlertDescription className="min-w-0 text-pretty">
        پس از تأیید واقعی پرداخت، خرید باید با فاکتور مرتبط باشد. این نسخه
        فاکتور تولید نمی‌کند.
      </AlertDescription>
    </Alert>
  );
}

function SnapshotLine(props: { footage: PurchaseSnapshot }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold leading-7">{props.footage.titleFa}</p>
      <p className="text-sm text-muted-foreground">
        تک‌فوتیج · {props.footage.qualities.join("، ")}
      </p>
    </div>
  );
}

function AuthPrompt(
  props: Pick<JourneyViewProps, "authenticated" | "returnTo">,
) {
  if (props.authenticated) return null;
  return (
    <Alert>
      <LockKeyhole aria-hidden="true" />
      <AlertTitle>برای ادامه وارد شوید</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <span>ورود با شماره موبایل، مسیر خرید همین فوتیج را حفظ می‌کند.</span>
        <Button
          render={
            <Link
              href={`/login?returnTo=${encodeURIComponent(props.returnTo)}`}
            />
          }
          nativeButton={false}
          size="sm"
          className="w-fit"
        >
          ورود و ادامه
          <ArrowLeft data-icon="inline-end" aria-hidden="true" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}

type PaymentStatusAlertProps = {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  live: "polite" | "assertive";
  variant?: "default" | "destructive";
  children?: ReactNode;
  className?: string;
};

function PaymentStatusAlert(props: PaymentStatusAlertProps) {
  return (
    <Alert
      className={`grid grid-cols-1 gap-3 ${props.className ?? ""}`}
      variant={props.variant}
      aria-live={props.live}
    >
      <div className="flex min-w-0 items-start gap-2">
        <span className="mt-0.5 shrink-0" aria-hidden="true">
          {props.icon}
        </span>
        <AlertTitle className="min-w-0 flex-1">{props.title}</AlertTitle>
      </div>
      <AlertDescription className="min-w-0 text-pretty">
        {props.description}
      </AlertDescription>
      {props.children ? (
        <div className="flex w-full flex-wrap items-center justify-start gap-2">
          {props.children}
        </div>
      ) : null}
    </Alert>
  );
}

function Status(props: JourneyViewProps) {
  const {
    state,
    authenticated,
    busy,
    onStart,
    onReset,
    footageHref,
    purchaseHref,
    returnTo,
  } = props;
  const stateHref = (nextState: PurchaseJourneyState) =>
    `${purchaseHref}?customer=authenticated&state=${nextState}`;

  if (state === "review") {
    return authenticated ? (
      <Button size="lg" className="w-full" onClick={onStart}>
        ادامه به پرداخت
        <ArrowLeft data-icon="inline-end" aria-hidden="true" />
      </Button>
    ) : (
      <AuthPrompt authenticated={authenticated} returnTo={returnTo} />
    );
  }
  if (state === "initiating") {
    return (
      <PaymentStatusAlert
        icon={
          <LoaderCircle className="motion-reduce:animate-none animate-spin" />
        }
        title="در حال آماده‌سازی پرداخت"
        description="به درگاه واقعی متصل نمی‌شویم؛ فقط وضعیت بارگذاری را نمایش می‌دهیم."
        live="polite"
      />
    );
  }
  if (state === "pending" || state === "verification-pending") {
    return (
      <PaymentStatusAlert
        icon={<Clock3 />}
        title={
          state === "pending"
            ? "پرداخت در انتظار نتیجه"
            : "تأیید پرداخت در انتظار است"
        }
        description="بازگشت از درگاه به معنی تأیید نیست. تا دریافت تأیید سروری، دسترسی ایجاد نمی‌شود."
        live="polite"
      >
        <Button
          variant="outline"
          render={<Link href={stateHref("returned")} />}
          nativeButton={false}
        >
          نمایش بازگشت از درگاه
        </Button>
        <Button variant="ghost" onClick={onReset}>
          بازگشت
        </Button>
      </PaymentStatusAlert>
    );
  }
  if (state === "returned") {
    return (
      <PaymentStatusAlert
        icon={<CircleAlert />}
        title="از درگاه بازگشتید؛ هنوز تأیید نشده"
        description="شناسه بازگشت آزمایشی ثبت شد، اما این صفحه عمداً موفقیت خرید را اعلام نمی‌کند."
        live="polite"
      >
        <Button
          render={<Link href={stateHref("verification-pending")} />}
          nativeButton={false}
        >
          ادامه به تأیید
        </Button>
        <Button
          variant="outline"
          render={<Link href={footageHref} />}
          nativeButton={false}
        >
          بازگشت امن به فوتیج
        </Button>
      </PaymentStatusAlert>
    );
  }
  if (state === "success") {
    return (
      <PaymentStatusAlert
        className="border-primary/50"
        icon={<CircleCheck />}
        title="موفقیت تأییدشده (fixture)"
        description="این فقط یک حالت نمایشی است؛ سفارش واقعی، فاکتور واقعی و دسترسی دانلود ایجاد نشده است."
        live="polite"
      >
        <Button onClick={onReset}>شروع دوباره</Button>
        <Button
          variant="outline"
          render={<Link href={footageHref} />}
          nativeButton={false}
        >
          بازگشت به فوتیج
        </Button>
      </PaymentStatusAlert>
    );
  }
  return (
    <PaymentStatusAlert
      icon={<CircleAlert />}
      title={
        state === "init-failed"
          ? "شروع پرداخت انجام نشد"
          : state === "failure"
            ? "پرداخت ناموفق بود"
            : "تأیید پرداخت ناموفق بود"
      }
      description="هیچ خرید یا دسترسی‌ای ایجاد نشده است. می‌توانید دوباره تلاش کنید یا به فوتیج برگردید."
      variant="destructive"
      live="assertive"
    >
      <Button onClick={onStart} disabled={busy}>
        <RotateCcw data-icon="inline-start" aria-hidden="true" />
        تلاش دوباره
      </Button>
      <Button
        variant="outline"
        render={<Link href={footageHref} />}
        nativeButton={false}
      >
        بازگشت امن
      </Button>
    </PaymentStatusAlert>
  );
}
