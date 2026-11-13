export function toggleAccordionOpenIds(
  current: string[],
  id: string,
  multiple = false,
): string[] {
  return current.includes(id)
    ? current.filter((item) => item !== id)
    : multiple
      ? [...current, id]
      : [id];
}
