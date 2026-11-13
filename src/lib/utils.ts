export type ClassValue =
  string | number | null | undefined | false | ClassValue[];

export function cn(...values: ClassValue[]): string {
  return values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter(Boolean)
    .join(" ");
}

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function fa(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

export function faNumber(value: number): string {
  return fa(Math.round(value).toLocaleString("en-US")).replace(/,/g, "٬");
}

export function formatToman(value: number): string {
  return `${faNumber(value)} تومان`;
}
