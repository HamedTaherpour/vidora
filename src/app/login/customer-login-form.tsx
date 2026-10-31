"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  isFixtureOtpSuccessful,
  maskCanonicalPhone,
  normalizeOtpDigits,
  resolveSafeReturnDestination,
  toLatinDigits,
  validateCustomerPhone,
  validateFixtureOtp,
  type CustomerLoginProps,
  type CustomerAuthStep,
} from "@/modules/ui-mock/fixtures/customer-auth";

const OTP_RESEND_SECONDS = 60;

export function CustomerLoginForm(props: CustomerLoginProps) {
  const { returnTo = "/" } = props;
  const [step, setStep] = useState<CustomerAuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(OTP_RESEND_SECONDS);

  const safeReturnTo = resolveSafeReturnDestination(returnTo);
  const canonicalPhone = useMemo(() => validateCustomerPhone(phone), [phone]);

  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const timer = window.setInterval(
      () => setResendIn((value) => Math.max(value - 1, 0)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [resendIn, step]);

  function submitPhone(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedPhone = validateCustomerPhone(phone);
    setError(
      normalizedPhone && normalizedPhone.startsWith("+")
        ? null
        : normalizedPhone,
    );
    setNotice(null);
    if (!normalizedPhone || !normalizedPhone.startsWith("+")) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      if (normalizedPhone.endsWith("00")) {
        setError("ارسال کد انجام نشد. چند لحظه بعد دوباره تلاش کنید.");
        return;
      }
      setStep("otp");
      setResendIn(OTP_RESEND_SECONDS);
      setNotice("کد شش‌رقمی برای شماره شما ارسال شد.");
    }, 650);
  }

  function submitOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedOtp = normalizeOtpDigits(otp);
    setError(null);
    setNotice(null);
    const otpError = validateFixtureOtp(otp);
    if (otpError) {
      setError(otpError);
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      if (!isFixtureOtpSuccessful(normalizedOtp)) {
        setError("این کد نادرست یا منقضی شده است. کد جدید درخواست کنید.");
        return;
      }
      setStep("success");
      setNotice(
        "ورود آزمایشی با موفقیت شبیه‌سازی شد؛ هیچ نشست واقعی ساخته نشد.",
      );
    }, 650);
  }

  function resendOtp() {
    if (resendIn > 0) return;
    setError(null);
    setNotice("کد آزمایشی جدید ارسال شد.");
    setResendIn(OTP_RESEND_SECONDS);
  }

  function resetToPhone() {
    setStep("phone");
    setOtp("");
    setError(null);
    setNotice(null);
  }

  return (
    <main
      dir="rtl"
      data-slot="minimal-customer-login"
      className="flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:px-6"
    >
      <Card className="w-full max-w-md border-border/70 shadow-sm">
        <CardHeader>
          <p className="text-sm font-semibold text-muted-foreground">
            ورود مشتری
          </p>
          <CardTitle className="text-2xl leading-tight sm:text-3xl">
            با شماره موبایل ادامه دهید
          </CardTitle>
          <CardDescription>
            برای ادامه خرید و دسترسی به فوتیج‌های شما، شماره موبایل‌تان را وارد
            کنید.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {notice ? (
            <Alert>
              <Check aria-hidden="true" />
              <AlertDescription role="status">{notice}</AlertDescription>
            </Alert>
          ) : null}
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>نیاز به بررسی</AlertTitle>
              <AlertDescription role="alert">{error}</AlertDescription>
            </Alert>
          ) : null}

          {step === "phone" ? (
            <form
              className="flex flex-col gap-5"
              onSubmit={submitPhone}
              noValidate
            >
              <FieldGroup>
                <Field data-invalid={Boolean(error)}>
                  <FieldLabel htmlFor="customer-phone">شماره موبایل</FieldLabel>
                  <Input
                    id="customer-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      setError(null);
                    }}
                    placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                    aria-invalid={Boolean(error)}
                    aria-describedby="phone-help"
                  />
                  <FieldDescription id="phone-help">
                    کد ورود برای شما پیامک می‌شود.
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? "در حال ارسال…" : "دریافت کد ورود"}
                {!loading ? (
                  <ArrowLeft data-icon="inline-end" aria-hidden="true" />
                ) : null}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                این نسخه برای بررسی طراحی است و هنوز به سرویس پیامک متصل نیست.
              </p>
            </form>
          ) : null}

          {step === "otp" ? (
            <form
              className="flex flex-col gap-5"
              onSubmit={submitOtp}
              noValidate
            >
              <FieldGroup>
                <Field data-invalid={Boolean(error)}>
                  <FieldLabel htmlFor="customer-otp">کد شش‌رقمی</FieldLabel>
                  <Input
                    id="customer-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    dir="ltr"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => {
                      setOtp(
                        toLatinDigits(event.target.value).replace(/\D/g, ""),
                      );
                      setError(null);
                    }}
                    placeholder="۱۲۳۴۵۶"
                    aria-invalid={Boolean(error)}
                    aria-describedby="otp-help"
                  />
                  <FieldDescription id="otp-help">
                    شماره:{" "}
                    {canonicalPhone?.startsWith("+") ? (
                      <span dir="ltr">
                        {maskCanonicalPhone(canonicalPhone)}
                      </span>
                    ) : (
                      phone
                    )}
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? "در حال بررسی…" : "تأیید و ادامه"}
              </Button>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <Button
                  type="button"
                  variant="link"
                  className="px-0"
                  onClick={resetToPhone}
                >
                  ویرایش شماره
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="px-0"
                  disabled={resendIn > 0}
                  onClick={resendOtp}
                >
                  {resendIn > 0
                    ? `ارسال دوباره تا ${resendIn} ثانیه`
                    : "ارسال دوباره کد"}
                </Button>
              </div>
            </form>
          ) : null}

          {step === "success" ? (
            <div className="flex flex-col gap-5 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold">آماده ادامه هستید</h2>
                <p className="text-muted-foreground">
                  مقصد داخلی انتخاب‌شده امن‌سازی و آماده نمایش است.
                </p>
              </div>
              <Button render={<a href={safeReturnTo} />} size="lg">
                بازگشت به فوتیج
                <ArrowLeft data-icon="inline-end" aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" onClick={resetToPhone}>
                <RotateCcw data-icon="inline-start" aria-hidden="true" />
                شروع دوباره پیش‌نمایش
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
