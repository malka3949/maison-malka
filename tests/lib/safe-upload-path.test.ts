import { describe, expect, it } from "vitest";
import {
  resolveSafeUploadPath,
  sanitizeStorageKeyFromSegments,
} from "@/lib/safe-upload-path";
import { sniffImageMime } from "@/lib/image-magic";
import path from "path";

describe("resolveSafeUploadPath", () => {
  const root = path.resolve("/tmp/uploads-test");

  it("resolves nested keys under root", () => {
    const abs = resolveSafeUploadPath(root, "prod/a.jpg");
    expect(abs).toBe(path.resolve(root, "prod", "a.jpg"));
  });

  it("rejects .. segments", () => {
    expect(resolveSafeUploadPath(root, "../secret")).toBeNull();
    expect(resolveSafeUploadPath(root, "a/../../secret")).toBeNull();
  });

  it("rejects encoded traversal after decode", () => {
    expect(resolveSafeUploadPath(root, "%2e%2e/secret")).toBeNull();
    expect(resolveSafeUploadPath(root, "x/%2e%2e/%2e%2e/etc")).toBeNull();
  });
});

describe("sanitizeStorageKeyFromSegments", () => {
  it("joins safe segments", () => {
    expect(sanitizeStorageKeyFromSegments(["a", "b.jpg"])).toBe("a/b.jpg");
  });

  it("rejects traversal segments", () => {
    expect(sanitizeStorageKeyFromSegments(["..", "x"])).toBeNull();
    expect(sanitizeStorageKeyFromSegments(["%2e%2e"])).toBeNull();
  });
});

describe("sniffImageMime", () => {
  it("detects jpeg", () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(sniffImageMime(buf)).toBe("image/jpeg");
  });

  it("detects png", () => {
    const buf = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
    ]);
    expect(sniffImageMime(buf)).toBe("image/png");
  });

  it("detects webp", () => {
    const buf = Buffer.from("RIFF....WEBP", "ascii");
    expect(sniffImageMime(buf)).toBe("image/webp");
  });

  it("rejects unknown", () => {
    expect(sniffImageMime(Buffer.from("not-an-image!!!"))).toBeNull();
  });
});
