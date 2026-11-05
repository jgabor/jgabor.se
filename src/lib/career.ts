import { getCollection } from "astro:content";
import { prepareCareer } from "../utils/career";

/** Career entries from src/data/career.json, with tenure, in display order. */
export async function getCareer() {
  const entries = await getCollection("career");
  return prepareCareer(entries.map((entry) => entry.data));
}
