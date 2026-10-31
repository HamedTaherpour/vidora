import { normalizeIranianMobile } from "@/modules/auth/otp/normalize-iranian-mobile";

export type CustomerAuthStep = "phone" | "otp" | "success";

export type CustomerLoginProps = {
  returnTo?: string;
};

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toLatinDigits(value: string): string {
  return [...value]
    .map((character) => {
      const persianIndex = PERSIAN_DIGITS.indexOf(character);
      if (persianIndex >= 0) return String(persianIndex);

      const arabicIndex = ARABIC_DIGITS.indexOf(character);
      return arabicIndex >= 0 ? String(arabicIndex) : character;
    })
    .join("");
}

export function validateCustomerPhone(value: string): string | null {
  const latinValue = toLatinDigits(value).replace(/\s/g, "");
  if (!latinValue) return "شماره موبایل را وارد کنید.";

  try {
    return normalizeIranianMobile(latinValue);
  } catch {
    return "یک شماره موبایل معتبر ایرانی وارد کنید؛ مانند ۰۹۱۲۱۲۳۴۵۶۷.";
  }
}

export function normalizeOtpDigits(value: string): string {
  return toLatinDigits(value);
}

export function validateFixtureOtp(value: string): string | null {
  return /^\d{6}$/.test(normalizeOtpDigits(value))
    ? null
    : "کد باید دقیقاً شش رقم باشد.";
}

export function isFixtureOtpSuccessful(value: string): boolean {
  return normalizeOtpDigits(value) === "123456";
}

export function resolveSafeReturnDestination(
  value: string | undefined,
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (
    value.startsWith("/admin") ||
    value.startsWith("/session") ||
    value.startsWith("/login")
  ) {
    return "/";
  }
  return value;
}

export function maskCanonicalPhone(phone: string): string {
  const toPersianDigits = (value: string) =>
    value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);
  return toPersianDigits(`0${phone.slice(3, 6)}***${phone.slice(-4)}`);
}
