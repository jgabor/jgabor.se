import { calculateTenure } from "./career-tenure.ts";

interface CareerData {
  order: number;
  roles: Array<{ period: string }>;
}

/** Adds each company's tenure and sorts companies by their `order` field. */
export function prepareCareer<T extends CareerData>(
  entries: T[],
  referenceDate = new Date(),
): Array<T & { tenure: string }> {
  return entries
    .map((entry) => ({ ...entry, tenure: calculateTenure(entry.roles, referenceDate) }))
    .sort((a, b) => a.order - b.order);
}
