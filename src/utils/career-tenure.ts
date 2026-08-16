const monthIndexes = new Map(
  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
    (month, index) => [month, index],
  ),
);

function periodMonth(value: string, referenceDate: Date): number {
  if (value === "Present") {
    return referenceDate.getUTCFullYear() * 12 + referenceDate.getUTCMonth();
  }

  const match = value.match(/^([A-Z][a-z]{2}) (\d{4})$/);
  const month = match ? monthIndexes.get(match[1]) : undefined;
  if (!match || month === undefined) throw new Error(`Invalid career period date: "${value}"`);

  return Number(match[2]) * 12 + month;
}

export function calculateTenure(
  roles: Array<{ period: string }>,
  referenceDate = new Date(),
): string {
  if (!roles.length) throw new Error("Cannot calculate tenure without roles");

  const boundaries = roles.map(({ period }) => {
    const parts = period.split(/\s+[—–-]\s+/);
    if (parts.length !== 2) throw new Error(`Invalid career period: "${period}"`);
    return parts.map((part) => periodMonth(part, referenceDate));
  });
  const start = Math.min(...boundaries.map(([roleStart]) => roleStart));
  const end = Math.max(...boundaries.map(([, roleEnd]) => roleEnd));
  const months = end - start;
  if (months < 0) throw new Error("Career period ends before it starts");

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return (
    [
      years ? `${years} ${years === 1 ? "year" : "years"}` : "",
      remainingMonths ? `${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}` : "",
    ]
      .filter(Boolean)
      .join(" ") || "0 months"
  );
}

export function tenureToMonths(tenure: string): number {
  const yearsMatch = tenure.match(/(\d+)\s*years?/i);
  const monthsMatch = tenure.match(/(\d+)\s*months?/i);
  const years = yearsMatch ? Number(yearsMatch[1]) : 0;
  const months = monthsMatch ? Number(monthsMatch[1]) : 0;
  return years * 12 + months;
}

export function formatTenureCompact(tenure: string): string {
  const yearsMatch = tenure.match(/(\d+)\s*years?/i);
  const monthsMatch = tenure.match(/(\d+)\s*months?/i);
  const years = yearsMatch ? Number(yearsMatch[1]) : 0;
  const months = monthsMatch ? Number(monthsMatch[1]) : 0;

  if (years && months) return `${years}y${months}m`;
  if (years) return `${years}y`;
  if (months) return `${months}m`;
  return "";
}

export function scaleBarHeights(tenures: string[], minPx: number, maxPx: number): number[] {
  const months = tenures.map((tenure) => tenureToMonths(tenure));
  const maxMonths = Math.max(...months, 1);
  return months.map((m) => minPx + (m / maxMonths) * (maxPx - minPx));
}

export function tenureRanks(tenures: string[]): number[] {
  const months = tenures.map((tenure) => tenureToMonths(tenure));
  const uniqueSorted = [...new Set(months)].sort((a, b) => a - b);
  return months.map((m) => uniqueSorted.indexOf(m) + 1);
}
