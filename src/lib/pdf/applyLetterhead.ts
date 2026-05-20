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
 *   1. Crystal Reports content — scaled to near-full A4 size (maximum quality,
 *      minimal scale change) and drawn top-aligned.  The Crystal Reports page's
 *      own signature marks land in the letterhead's transparent blank-signature
 *      zone; the Crystal Reports header/footer land under the letterhead's opaque
 *      header/footer and are covered.
 *   2. Letterhead PNG — painted on top at full A4 size.
 *        • Rows    0–159  ( 0–10.7 %): opaque Nova header (covers CR header)
 *        • Rows  160–1292 (10.7–86.7 %): TRANSPARENT — CR body, blank signature
 *          area, and actual signature marks all show through (ends at 730pt)
 *        • Rows 1293–1491 (86.7–100 %): opaque underlines, printed names, footer
 *
 * Crystal Reports PDFs are often Letter-size (612×792 pt).
 * They are scaled uniformly to the maximum size that fits A4, then top-aligned
 * so that the signature section aligns with the letterhead's signature zone.
 * This near-1:1 scaling preserves PDF vector quality (no visible degradation).
 *
 * Falls back to the original file unchanged if the letterhead asset is missing.
 */

// Output page is always A4
const OUT_W = 595;
const OUT_H = 842;

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

    // Scale Crystal Reports to the maximum size that fits A4 while preserving
    // aspect ratio.  For a standard Letter page (612×792 pt) this is ≈ 0.972×,
    // virtually lossless.  For an A4 source it is exactly 1.0×.
    const scale = Math.min(OUT_W / srcW, OUT_H / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;

    // Centre horizontally; top-align vertically (pdf-lib y-origin is bottom-left).
    // Transparent zone ends at row 1292 = 730pt from A4 top, which fully covers
    // the CR signature marks at ~703–728pt — no shift needed.
    const drawX = (OUT_W - drawW) / 2;
    const drawY = OUT_H - drawH;

    const page = outDoc.addPage([OUT_W, OUT_H]);

    // Layer 0 — solid white background
    page.drawRectangle({ x: 0, y: 0, width: OUT_W, height: OUT_H, color: rgb(1, 1, 1) });

    // Layer 1 — Crystal Reports content (near-full scale, top-aligned)
    page.drawPage(embeddedPage, { x: drawX, y: drawY, width: drawW, height: drawH });

    // Layer 2 — Letterhead on top
    page.drawImage(letterheadImg, { x: 0, y: 0, width: OUT_W, height: OUT_H });
  }

  const outBytes = await outDoc.save();
  const baseName = sourceFile.name.replace(/\.pdf$/i, "");
  const outBuffer = outBytes.buffer.slice(
    outBytes.byteOffset,
    outBytes.byteOffset + outBytes.byteLength
  ) as ArrayBuffer;

  return {
    file: new File([outBuffer], `${baseName}_nova.pdf`, { type: "application/pdf" }),
    applied: true,
  };
}
