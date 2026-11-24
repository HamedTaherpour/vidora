import { fa } from "@/lib/utils";

export function maskCustomerPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^98/, "0");
  if (digits.length < 8) return fa(phone);

  return fa(`${digits.slice(0, 4)} *** ${digits.slice(-4)}`);
}
