/**
 * Format integer Toman for Persian-friendly Admin display.
 * Does not convert to Rial. Does not use floating-point money math.
 */
export function formatTomanDisplay(priceToman: number): string {
  if (!Number.isInteger(priceToman) || !Number.isSafeInteger(priceToman)) {
    throw new Error("priceToman must be a safe integer.");
  }

  return `${priceToman.toLocaleString("fa-IR")} تومان`;
}
