import { formatToman } from "@/lib/utils";

export function formatFootageCardPrice(
  priceToman: number,
  developmentOnly: boolean,
): string {
  const price = formatToman(priceToman);
  return developmentOnly ? `نمونهٔ توسعه · ${price}` : price;
}
