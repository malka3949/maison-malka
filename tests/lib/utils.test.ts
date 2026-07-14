import { describe, expect, it } from "vitest";
import {
  isAdminEmail,
  isAllowedImageType,
  parsePrice,
  resolveUserRole,
  slugify,
} from "@/lib/utils";
import { UserRole } from "@prisma/client";

describe("isAdminEmail", () => {
  it("matches admin email case-insensitively", () => {
    expect(isAdminEmail("Admin@Example.com", "admin@example.com")).toBe(true);
    expect(isAdminEmail("other@example.com", "admin@example.com")).toBe(false);
  });

  it("returns false when admin email is missing", () => {
    expect(isAdminEmail("admin@example.com", undefined)).toBe(false);
  });
});

describe("resolveUserRole", () => {
  it("assigns admin role for configured email", () => {
    expect(resolveUserRole("admin@maison-malka.example", "admin@maison-malka.example")).toBe(
      UserRole.admin,
    );
    expect(resolveUserRole("guest@example.com", "admin@maison-malka.example")).toBe(
      UserRole.customer,
    );
  });
});

describe("slugify", () => {
  it("creates URL-safe slugs", () => {
    expect(slugify("  Hello World!  ")).toBe("hello-world");
  });
});

describe("parsePrice", () => {
  it("parses valid prices and rejects invalid", () => {
    expect(parsePrice("120.5")).toBe(120.5);
    expect(parsePrice("12,50")).toBe(12.5);
    expect(parsePrice("-1")).toBeNull();
    expect(parsePrice("abc")).toBeNull();
  });
});

describe("isAllowedImageType", () => {
  it("allows only jpeg, png, webp", () => {
    expect(isAllowedImageType("image/jpeg")).toBe(true);
    expect(isAllowedImageType("image/gif")).toBe(false);
  });
});
