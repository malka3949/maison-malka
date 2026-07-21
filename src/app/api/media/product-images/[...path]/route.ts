import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import {
  isImageContentType,
  localUploadAbsolutePath,
  localUploadExists,
  writeLocalProductImage,
} from "@/lib/local-product-images";
import { sanitizeStorageKeyFromSegments } from "@/lib/safe-upload-path";

export const runtime = "nodejs";

const BUCKET = "product-images";

function guessContentType(storagePath: string): string {
  const lower = storagePath.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const storagePath = sanitizeStorageKeyFromSegments(segments ?? []);
  if (!storagePath) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  try {
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
  } catch {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  const upstream = `${base.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${storagePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

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
    console.error("[media] upstream was not an image:", contentType, storagePath);
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
