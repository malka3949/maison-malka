import { prisma } from "@/lib/prisma";

/** Best-effort audit trail for sensitive admin/PII actions (Amendment 13 / Reg. 10). */
export async function writeAccessAudit(input: {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  resource?: string | null;
  detail?: string | null;
  success?: boolean;
}): Promise<void> {
  try {
    await prisma.accessAuditLog.create({
      data: {
        actor_id: input.actorId ?? null,
        actor_email: input.actorEmail ?? null,
        action: input.action.slice(0, 120),
        resource: input.resource?.slice(0, 200) ?? null,
        detail: input.detail?.slice(0, 500) ?? null,
        success: input.success !== false,
      },
    });
  } catch (err) {
    console.error("[audit] write failed", err);
  }
}
