import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { describe, it } from "node:test";
import { PDFParse } from "pdf-parse";

const PDF_PATH = "public/CV-Jonathan_Gabor.pdf";

async function extractText() {
  const buf = await readFile(PDF_PATH);
  const parser = new PDFParse({ data: new Uint8Array(buf) });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

describe("CV PDF (public/CV-Jonathan_Gabor.pdf)", () => {
  it("exists and is a non-trivial file", async () => {
    const st = await stat(PDF_PATH);
    assert.ok(st.size > 50_000, `expected >50KB, got ${st.size} bytes`);
  });

  it("renders the full name and headline", async () => {
    const text = await extractText();
    // The print stylesheet applies text-transform: uppercase to .name and
    // .title, so the extracted text is uppercased.
    assert.match(text, /JONATHAN GABOR/);
    assert.match(text, /SPEAKS CODE, SHIPS PRODUCT/);
  });

  it("lists every company in the career collection", async () => {
    const text = await extractText();
    // Company headers are rendered with text-transform: uppercase; check the
    // source spelling case-insensitively to stay robust to style changes.
    for (const company of ["IKEA", "UpCloud", "Cloud Royale", "FS Data", "Surftown"]) {
      assert.match(text, new RegExp(company, "i"), `missing company: ${company}`);
    }
  });

  it("includes a role title from each company", async () => {
    const text = await extractText();
    const sentinels = [
      /Senior Software Engineer/i,
      /Product Owner.*Operational Intelligence/i,
      /Head of Data/i,
      /Founder/i,
      /Support Coordinator/i,
    ];
    for (const re of sentinels) {
      assert.match(text, re, `missing role sentinel: ${re}`);
    }
  });

  it("renders CV-specific copy (cvDescription) when present", async () => {
    const text = await extractText();
    assert.match(text, /synthetic monitoring/i);
    assert.match(text, /centralized data platform/i);
    assert.match(text, /brand overhaul/i);
  });

  it("includes the contact block and location", async () => {
    const text = await extractText();
    assert.match(text, /jonathan@jgabor\.se/);
    assert.match(text, /linkedin\.com\/in\/jgabor/);
    assert.match(text, /Malm/);
  });
});
