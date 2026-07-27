import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { buildCampaignEmail } from "@/lib/campaigns/templates";
import { isPdfMagicForTest } from "@/lib/campaigns/upload";
import { toResendAttachmentPayload } from "@/lib/notifications/resend";

describe("phase9 campaign media", () => {
  const prevDedicated = process.env.CAMPAIGN_UNSUBSCRIBE_SECRET;

  beforeEach(() => {
    process.env.CAMPAIGN_UNSUBSCRIBE_SECRET = "test-campaign-secret";
  });

  afterEach(() => {
    if (prevDedicated === undefined) {
      delete process.env.CAMPAIGN_UNSUBSCRIBE_SECRET;
    } else {
      process.env.CAMPAIGN_UNSUBSCRIBE_SECRET = prevDedicated;
    }
  });

  it("includes img when imageUrl provided", () => {
    const built = buildCampaignEmail({
      subject: "Promo",
      body: "Hello",
      recipientEmail: "a@b.com",
      imageUrl: "https://example.com/promo.jpg",
    });
    expect(built).not.toBeNull();
    expect(built!.html).toContain('<img src="https://example.com/promo.jpg"');
    expect(built!.html).toContain("/unsubscribe?token=");
  });

  it("omits img when no imageUrl", () => {
    const built = buildCampaignEmail({
      subject: "Promo",
      body: "Hello",
      recipientEmail: "a@b.com",
    });
    expect(built).not.toBeNull();
    expect(built!.html).not.toContain("<img ");
  });

  it("rejects non-http image urls", () => {
    const built = buildCampaignEmail({
      subject: "Promo",
      body: "Hello",
      recipientEmail: "a@b.com",
      imageUrl: "javascript:alert(1)",
    });
    expect(built!.html).not.toContain("javascript:");
    expect(built!.html).not.toContain("<img ");
  });

  it("shapes resend attachments", () => {
    const payload = toResendAttachmentPayload([
      { filename: "flyer.pdf", contentBase64: "AAA" },
    ]);
    expect(payload).toEqual([{ filename: "flyer.pdf", content: "AAA" }]);
  });

  it("detects pdf magic", () => {
    expect(isPdfMagicForTest(Buffer.from("%PDF-1.4"))).toBe(true);
    expect(isPdfMagicForTest(Buffer.from("not-pdf"))).toBe(false);
  });
});
