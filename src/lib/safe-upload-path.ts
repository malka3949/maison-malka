import path from "path";

/**
 * Resolve a storage key under an uploads root, rejecting path traversal.
 * Decodes URI components first, then rejects `.` / `..` / separators.
 */
export function resolveSafeUploadPath(
  uploadsRoot: string,
  storageKey: string,
): string | null {
  const root = path.resolve(uploadsRoot);
  const segments = storageKey
    .split("/")
    .flatMap((part) => {
      try {
        return [decodeURIComponent(part)];
      } catch {
        return [part];
      }
    })
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length === 0) return null;

  for (const seg of segments) {
    if (
      seg === "." ||
      seg === ".." ||
      seg.includes("\0") ||
      seg.includes("/") ||
      seg.includes("\\") ||
      (process.platform === "win32" && /^[a-zA-Z]:$/.test(seg))
    ) {
      return null;
    }
  }

  const resolved = path.resolve(root, ...segments);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  if (resolved !== root && !resolved.startsWith(rootWithSep)) {
    return null;
  }
  return resolved;
}

/** Normalize catch-all route segments into a safe relative storage key. */
export function sanitizeStorageKeyFromSegments(segments: string[]): string | null {
  if (!segments.length) return null;
  const parts: string[] = [];
  for (const raw of segments) {
    let seg: string;
    try {
      seg = decodeURIComponent(raw).trim();
    } catch {
      seg = raw.trim();
    }
    if (!seg) continue;
    if (
      seg === "." ||
      seg === ".." ||
      seg.includes("\0") ||
      seg.includes("/") ||
      seg.includes("\\")
    ) {
      return null;
    }
    parts.push(seg);
  }
  return parts.length ? parts.join("/") : null;
}
