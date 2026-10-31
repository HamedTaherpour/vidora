/** Formats non-negative seconds as a Persian-localized MM:SS duration. */
export function formatDuration(seconds: number | undefined): string {
  if (!Number.isFinite(seconds) || seconds === undefined || seconds < 0) {
    return "—";
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainder = totalSeconds % 60;
  const formatPart = (value: number) =>
    new Intl.NumberFormat("fa-IR", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    }).format(value);

  return `${formatPart(minutes)}:${formatPart(remainder)}`;
}
