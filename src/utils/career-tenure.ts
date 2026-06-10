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

export function scaleBarHeights(
  tenures: string[],
  minPx: number,
  maxPx: number,
): number[] {
  const months = tenures.map((tenure) => tenureToMonths(tenure));
  const maxMonths = Math.max(...months, 1);
  return months.map((m) => minPx + (m / maxMonths) * (maxPx - minPx));
}

export function tenureRanks(tenures: string[]): number[] {
  const months = tenures.map((tenure) => tenureToMonths(tenure));
  const uniqueSorted = [...new Set(months)].sort((a, b) => a - b);
  return months.map((m) => uniqueSorted.indexOf(m) + 1);
}
