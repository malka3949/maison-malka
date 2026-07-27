import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  createUnsubscribeToken,
  normalizeEmail,
  verifyUnsubscribeToken,
} from "@/lib/campaigns/email";
import {
  buildCampaignEmail,
  escapeCampaignBodyForTest,
} from "@/lib/campaigns/templates";
import { CAMPAIGN_BATCH_SIZE } from "@/lib/campaigns/send";
import * as fs from "fs";
import * as path from "path";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Dana@Example.COM ")).toBe("dana@example.com");
  });
});

describe("unsubscribe tokens", () => {
  const prevDedicated = process.env.CAMPAIGN_UNSUBSCRIBE_SECRET;
  const prevService = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    process.env.CAMPAIGN_UNSUBSCRIBE_SECRET = "test-campaign-secret";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterEach(() => {
    if (prevDedicated === undefined) delete process.env.CAMPAIGN_UNSUBSCRIBE_SECRET;
    else process.env.CAMPAIGN_UNSUBSCRIBE_SECRET = prevDedicated;
    if (prevService === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = prevService;
  });

  it("round-trips email", () => {
    const token = createUnsubscribeToken("User@Example.com");
    expect(token).toBeTruthy();
    expect(verifyUnsubscribeToken(token!)).toBe("user@example.com");
  });

  it("rejects tampered token", () => {
    const token = createUnsubscribeToken("a@b.com");
    expect(verifyUnsubscribeToken(token! + "x")).toBeNull();
    expect(verifyUnsubscribeToken("not-a-token")).toBeNull();
  });
});

describe("campaign template", () => {
  const prevDedicated = process.env.CAMPAIGN_UNSUBSCRIBE_SECRET;

  beforeEach(() => {
    process.env.CAMPAIGN_UNSUBSCRIBE_SECRET = "test-campaign-secret";
  });

  afterEach(() => {
    if (prevDedicated === undefined) delete process.env.CAMPAIGN_UNSUBSCRIBE_SECRET;
    else process.env.CAMPAIGN_UNSUBSCRIBE_SECRET = prevDedicated;
  });

  it("escapes HTML in body", () => {
    expect(escapeCampaignBodyForTest(`<script>alert(1)</script>`)).toContain(
      "&lt;script&gt;",
    );
  });

  it("includes unsubscribe link", () => {
    const built = buildCampaignEmail({
      subject: "Promo",
      body: "Hello\nWorld",
      recipientEmail: "guest@example.com",
      locale: "he",
    });
    expect(built).not.toBeNull();
    expect(built!.html).toContain("/he/unsubscribe?token=");
    expect(built!.html).toContain("הסרה מרשימת דיוור");
    expect(built!.html).not.toContain("<script>");
  });
});

describe("campaign module separation", () => {
  it("does not import sendOrder helpers from send.ts", () => {
    const sendPath = path.join(
      process.cwd(),
      "src/lib/campaigns/send.ts",
    );
    const source = fs.readFileSync(sendPath, "utf8");
    expect(source).not.toMatch(/sendOrderReceived|sendOrderApproved|sendOrderRejected|sendOrderCompleted|sendOrderAdminNew/);
    expect(source).toContain("sendTransactionalEmail");
    expect(CAMPAIGN_BATCH_SIZE).toBeGreaterThan(0);
  });
});
