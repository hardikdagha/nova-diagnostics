import { PDFDocument } from "pdf-lib";

/**
 * Overlays the Nova Diagnostics letterhead PNG on every page of the source PDF.
 *
 * Letterhead asset: /assets/letterhead.png  (place in /public/assets/)
 *
 * The PNG must be full-page (same dimensions as the report PDF, e.g. A4 at 595×842 pt):
 *   - Opaque header band  — Nova logo, lab name, address, contact
 *   - Transparent body    — Crystal Reports content shows through
 *   - Opaque footer band  — Doctor name, signature, registration number
 *
 * Layer order per page:
 *   1. Crystal Reports content (embedded source page — background)
 *   2. Letterhead PNG overlay (header + footer opaque, body transparent)
 *
 * If the asset is missing or fails to load the original file is returned unchanged
 * so the upload workflow still functions without a letterhead configured.
 */
export async function applyLetterhead(
  sourceFile: File
): Promise<{ file: File; applied: boolean }> {
  // --- 1. Try to load the letterhead asset ---
  let letterheadBytes: ArrayBuffer | null = null;
  try {
    const res = await fetch("/assets/letterhead.png");
    if (res.ok) {
      letterheadBytes = await res.arrayBuffer();
    }
  } catch {
    // Asset not configured — fall back to original
  }

  if (!letterheadBytes) {
    return { file: sourceFile, applied: false };
  }

  // --- 2. Load source PDF and create output document ---
  const srcBytes = await sourceFile.arrayBuffer();
  const srcDoc = await PDFDocument.load(srcBytes);
  const outDoc = await PDFDocument.create();

  const letterheadImg = await outDoc.embedPng(letterheadBytes);
  const pageCount = srcDoc.getPageCount();

  for (let i = 0; i < pageCount; i++) {
    const srcPage = srcDoc.getPage(i);
    const [embeddedPage] = await outDoc.embedPages([srcPage]);
    const { width, height } = srcPage.getSize();

    const page = outDoc.addPage([width, height]);

    // Layer 1 — Crystal Reports content (drawn first, underneath)
    page.drawPage(embeddedPage, { x: 0, y: 0, width, height });

    // Layer 2 — Letterhead overlay (drawn on top; transparent body reveals layer 1)
    page.drawImage(letterheadImg, { x: 0, y: 0, width, height });
  }

  const outBytes = await outDoc.save();
  const baseName = sourceFile.name.replace(/\.pdf$/i, "");
  // pdf-lib returns Uint8Array<ArrayBufferLike>; slice() guarantees a plain ArrayBuffer
  const outBuffer = outBytes.buffer.slice(
    outBytes.byteOffset,
    outBytes.byteOffset + outBytes.byteLength
  ) as ArrayBuffer;
  const outFile = new File([outBuffer], `${baseName}_nova.pdf`, {
    type: "application/pdf",
  });

  return { file: outFile, applied: true };
}
