import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { calculateTenure } from "./career-tenure.ts";

interface CareerEntry {
  company: string;
  roles: Array<{ period: string }>;
}

describe("calculateTenure", () => {
  it("calculates every company tenure from its role periods", async () => {
    const entries = JSON.parse(
      await readFile(new URL("../data/career.json", import.meta.url), "utf8"),
    ) as CareerEntry[];
    const referenceDate = new Date("2026-08-16T00:00:00Z");
    const tenures = Object.fromEntries(
      entries.map((entry) => [entry.company, calculateTenure(entry.roles, referenceDate)]),
    );

    assert.deepEqual(tenures, {
      IKEA: "4 years 6 months",
      UpCloud: "5 years 11 months",
      "Cloud Royale": "3 years 7 months",
      "FS Data": "1 year 6 months",
      "Surftown A/S": "4 years 6 months",
    });
  });

  it("advances current tenure as the reference month changes", () => {
    const roles = [{ period: "Feb 2022 — Present" }];

    assert.equal(calculateTenure(roles, new Date("2026-08-31T23:59:59Z")), "4 years 6 months");
    assert.equal(calculateTenure(roles, new Date("2026-09-01T00:00:00Z")), "4 years 7 months");
  });

  it("rejects malformed periods", () => {
    assert.throws(() => calculateTenure([{ period: "February 2022 to Present" }]));
  });
});
