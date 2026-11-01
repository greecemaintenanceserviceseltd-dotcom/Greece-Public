import type { Config, Context } from "@netlify/functions";
import { and, eq, lt, ne } from "drizzle-orm";
import { getDb } from "../../db/index.js";
import * as schema from "../../db/schema.js";
import { createBackup, fileStore } from "../../db/staff-api.js";

export default async (_req: Request, context: Context) => {
  const db = getDb(), now = new Date(), today = now.toISOString().slice(0, 10);
  await db.delete(schema.request_limits).where(lt(schema.request_limits.expires_at, now.toISOString()));
  await db.delete(schema.page_views).where(lt(schema.page_views.created_at, new Date(now.getTime() - 90 * 86400000).toISOString()));
  await db.update(schema.invoices).set({ status: "overdue", updated_at: now.toISOString() }).where(and(eq(schema.invoices.status, "sent"), lt(schema.invoices.due_date, today)));
  await db.update(schema.quotes).set({ status: "expired", updated_at: now.toISOString() }).where(and(ne(schema.quotes.status, "accepted"), ne(schema.quotes.status, "converted"), ne(schema.quotes.status, "rejected"), lt(schema.quotes.valid_until, today)));
  await createBackup(db, context);
  const old = await db.select().from(schema.backup_runs).where(lt(schema.backup_runs.created_at, new Date(now.getTime() - 30 * 86400000).toISOString()));
  for (const row of old) {
    if (!row.filename.startsWith("production/")) continue;
    await fileStore().delete(row.filename);
    await db.delete(schema.backup_runs).where(eq(schema.backup_runs.id, row.id));
  }
};

export const config: Config = { schedule: "@daily", background: true };
