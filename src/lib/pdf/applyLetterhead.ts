import { PDFDocument, rgb } from "pdf-lib";

/**
 * Composites every page of the source PDF onto the Nova Diagnostics letterhead.
 *
 * Letterhead asset: /assets/letterhead.png  (place in /public/assets/)
 *
 * Layer order per output page:
 *   0. Solid white rectangle — fills the entire A4 page so the output PDF has no
 *      transparent pixels.  Without this, PDF viewers render transparency as a
 *      gray checkerboard pattern in both the header and footer zones.
 *   1. Crystal Reports content — scaled to fit inside the letterhead's transparent content
 *      area and drawn on top of the white background.
 *   2. Letterhead PNG — painted on top at full A4 size.  Its opaque header and footer
 *      naturally cover any Crystal Reports margins; the transparent body reveals the
 *      report content beneath.  This guarantees zero overlap and zero background tint.
 *
 * Content area boundaries (pre-computed from Latest_Temp.png pixel analysis):
 *   Header content ends at row 179/1492 of the PNG → 12.20 % from top (with 3-row buffer)
 *   Footer content starts at row 1225/1492 of the PNG → 81.90 % from top (with 3-row buffer)
 *   Gives ≈ 587 pt of visible content area on A4
 *
 * Crystal Reports PDFs are often Letter-size (612×792 pt).  The content is scaled
 * uniformly to fill the available content-area height, then centred horizontally.
 *
 * Falls back to the original file unchanged if the letterhead asset is missing.
 */

// Output page is always A4
const OUT_W = 595;
const OUT_H = 842;

// Letterhead content-area boundaries (measured from Latest_Temp.png — 1054×1492 px)
//   Header content ends at row 179 (+3 buffer) → 12.20 % from top
//   Footer content begins at row 1225 (-3 buffer) → 81.90 % from top
const HEADER_END_FRAC = 0.1220;   // header ends at 12.20 % from top  (≈ 103 pt on A4)
const FOOTER_START_FRAC = 0.8190; // footer starts at 81.90 % from top (≈ 690 pt on A4)

const CONTENT_TOP = HEADER_END_FRAC * OUT_H;      // ≈ 102.7 pt from top
const CONTENT_BOTTOM = FOOTER_START_FRAC * OUT_H;  // ≈ 689.6 pt from top
const CONTENT_H = CONTENT_BOTTOM - CONTENT_TOP;   // ≈ 586.9 pt available

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

    // Layer 0 — solid white background; prevents the PDF transparency
    //           from rendering as a gray checkerboard in viewers/printers
    page.drawRectangle({ x: 0, y: 0, width: OUT_W, height: OUT_H, color: rgb(1, 1, 1) });

    // Layer 1 — Crystal Reports content (scaled to sit within the content area)
    page.drawPage(embeddedPage, { x: drawX, y: drawY, width: drawW, height: drawH });

    // Layer 2 — Letterhead on top (opaque header + footer cover CR margins;
    //           transparent body reveals CR content — no overlap, no tint)
    page.drawImage(letterheadImg, { x: 0, y: 0, width: OUT_W, height: OUT_H });
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
