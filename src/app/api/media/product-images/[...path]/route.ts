import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import {
  isImageContentType,
  localUploadAbsolutePath,
  localUploadExists,
  writeLocalProductImage,
} from "@/lib/local-product-images";

export const runtime = "nodejs";

const BUCKET = "product-images";

function guessContentType(storagePath: string): string {
  const lower = storagePath.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

/**
 * Same-origin image delivery for Supabase Storage.
 * Prefer local disk cache under public/uploads (NetFree-friendly static).
 * Otherwise fetch from Supabase, reject non-image responses (filter block pages),
 * cache locally, then stream.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const safe = (segments ?? []).filter(
    (s) => s.length > 0 && !s.includes("..") && !s.includes("\\") && !s.includes("\0"),
  );
  if (safe.length === 0) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const storagePath = safe.map(decodeURIComponent).join("/");

  if (await localUploadExists(storagePath)) {
    const buf = await readFile(localUploadAbsolutePath(storagePath));
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": guessContentType(storagePath),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  const upstream = `${base.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${storagePath}`;

  let response: Response;
  try {
    response = await fetch(upstream, { cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: "Image not found" },
      { status: response.status === 404 ? 404 : 502 },
    );
  }

  const contentType = response.headers.get("content-type");
  if (!isImageContentType(contentType)) {
    // Typical when NetFree (or similar) returns an HTML/block interstitial
    console.error(
      "[media] upstream was not an image:",
      contentType,
      storagePath,
    );
    return NextResponse.json(
      {
        error:
          "התמונה נחסמה או לא התקבלה כקובץ תמונה מהאחסון (לעיתים נטפרי). נסו להעלות מחדש.",
      },
      { status: 502 },
    );
  }

  const body = Buffer.from(await response.arrayBuffer());
  try {
    await writeLocalProductImage(storagePath, body);
  } catch (err) {
    console.warn("[media] local cache write failed:", err);
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType ?? guessContentType(storagePath),
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
