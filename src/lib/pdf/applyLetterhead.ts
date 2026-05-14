import { PDFDocument } from "pdf-lib";

/**
 * Composites every page of the source PDF onto the Nova Diagnostics letterhead.
 *
 * Letterhead asset: /assets/letterhead.png  (place in /public/assets/)
 *
 * Layer order per output page:
 *   1. Letterhead PNG — drawn as the full-A4 background (header + footer opaque, body transparent)
 *   2. Crystal Reports content — scaled to fit inside the letterhead's transparent content area
 *      so the opaque header/footer are never obscured by report content.
 *
 * Content area boundaries (pre-computed from letterhead.png pixel analysis):
 *   Header separator at y=218/1865 → transparent body starts at y=220 (11.80%)
 *   Footer content starts at y=1492/1865 (80.00%)
 *   Gives ≈574 pt of visible content area on A4
 *
 * Crystal Reports PDFs are often Letter-size (612×792 pt).  The content is scaled
 * uniformly to fill the available content-area height, then centred horizontally.
 *
 * Falls back to the original file unchanged if the letterhead asset is missing.
 */

// Output page is always A4
const OUT_W = 595;
const OUT_H = 842;

// Letterhead content-area boundaries (measured from letterhead.png)
// Boundaries measured from the signed letterhead PNG (1320×1865):
//   Header separator line: y=218 → first transparent row at y=220
//   Footer content begins: y=1492
const HEADER_END_FRAC = 0.1180;   // header ends at 11.80 % from top  (≈  99 pt on A4)
const FOOTER_START_FRAC = 0.8000; // footer starts at 80.00 % from top (≈ 674 pt on A4)

const CONTENT_TOP = HEADER_END_FRAC * OUT_H;      // ≈  99.3 pt from top
const CONTENT_BOTTOM = FOOTER_START_FRAC * OUT_H;  // ≈ 673.6 pt from top
const CONTENT_H = CONTENT_BOTTOM - CONTENT_TOP;   // ≈ 574.3 pt available

export async function applyLetterhead(
  sourceFile: File
): Promise<{ file: File; applied: boolean }> {
  // --- 1. Try to load the letterhead asset ---
  let letterheadBytes: ArrayBuffer | null = null;
  try {
    const res = await fetch("/assets/letterhead.png");
    if (res.ok) letterheadBytes = await res.arrayBuffer();
  } catch {
    /* asset not configured — fall back gracefully */
  }

  if (!letterheadBytes) {
    return { file: sourceFile, applied: false };
  }

  // --- 2. Load source PDF ---
  const srcBytes = await sourceFile.arrayBuffer();
  const srcDoc = await PDFDocument.load(srcBytes);
  const outDoc = await PDFDocument.create();

  const letterheadImg = await outDoc.embedPng(letterheadBytes);
  const pageCount = srcDoc.getPageCount();

  for (let i = 0; i < pageCount; i++) {
    const srcPage = srcDoc.getPage(i);
    const [embeddedPage] = await outDoc.embedPages([srcPage]);
    const srcW = srcPage.getWidth();
    const srcH = srcPage.getHeight();

    // Scale Crystal Reports to fill the content area (maintain aspect ratio)
    const scale = Math.min(OUT_W / srcW, CONTENT_H / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;

    // Centre horizontally; align top of report content with bottom of letterhead header
    const drawX = (OUT_W - drawW) / 2;
    // pdf-lib y origin is bottom-left; position so top of draw area = CONTENT_TOP from page top
    const drawY = OUT_H - CONTENT_TOP - drawH;

    const page = outDoc.addPage([OUT_W, OUT_H]);

    // Layer 1 — Letterhead (background); content area is transparent
    page.drawImage(letterheadImg, { x: 0, y: 0, width: OUT_W, height: OUT_H });

    // Layer 2 — Crystal Reports content (scaled, sits entirely within content area)
    page.drawPage(embeddedPage, { x: drawX, y: drawY, width: drawW, height: drawH });
  }

  const outBytes = await outDoc.save();
  const baseName = sourceFile.name.replace(/\.pdf$/i, "");
  // pdf-lib returns Uint8Array<ArrayBufferLike>; slice() gives a plain ArrayBuffer
  const outBuffer = outBytes.buffer.slice(
    outBytes.byteOffset,
    outBytes.byteOffset + outBytes.byteLength
  ) as ArrayBuffer;

  return {
    file: new File([outBuffer], `${baseName}_nova.pdf`, { type: "application/pdf" }),
    applied: true,
  };
}
