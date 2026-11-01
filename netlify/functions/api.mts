import type { Config, Context } from "@netlify/functions";
import { getUser, login, logout, refreshSession, requestPasswordRecovery, recoverPassword, acceptInvite, confirmEmail, verifyRequestOrigin } from "@netlify/identity";
import { and, eq, desc, sql, lt } from "drizzle-orm";
import { createHash, randomUUID } from "node:crypto";
import { getDb } from "../../db/index.js";
import * as schema from "../../db/schema.js";
import { ApiError, publicSubmission, required, text, permissions } from "../../db/validation.js";
import { emailStatus, sendMail } from "../../db/email.js";
import { staffRoutes } from "../../db/staff-api.js";
import { publicCustomerRoutes } from "../../db/customer-api.js";

async function rateLimit(db: ReturnType<typeof getDb>, context: Context, action: string, maximum: number) {
  const bucket = Math.floor(Date.now() / 600000);
  const key = `${action}:${createHash("sha256").update(context.ip || "unknown").digest("hex")}:${bucket}`;
  const rows = await db.insert(schema.request_limits).values({ key, hits: 1, expires_at: new Date((bucket + 2) * 600000).toISOString() })
    .onConflictDoUpdate({ target: schema.request_limits.key, set: { hits: sql`${schema.request_limits.hits} + 1` }, setWhere: lt(schema.request_limits.hits, maximum) }).returning();
  if (!rows.length) throw new ApiError(429, "Too many requests. Please try again later.", "RATE_LIMITED");
}

export async function readBody(req: Request) {
  if (Number(req.headers.get("content-length") || 0) > 5 * 1024 * 1024) throw new ApiError(413, "Request is too large");
  const raw = await req.text();
  if (Buffer.byteLength(raw) > 5 * 1024 * 1024) throw new ApiError(413, "Request is too large");
  if (!raw) return {};
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw Error();
    return data as Record<string, any>;
  } catch {
    throw new ApiError(400, "A JSON object is required");
  }
}

async function handle(req: Request, context: Context) {
  const url = new URL(req.url), path = url.pathname.replace(/\/$/, ""), method = req.method;
  const body = ["POST", "PUT", "PATCH", "DELETE"].includes(method) ? await readBody(req) : {};
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && req.headers.has("origin")) verifyRequestOrigin(req);

  if (path === "/api/health" && method === "GET") {
    try {
      await getDb().select({ id: schema.leads.id }).from(schema.leads).limit(1);
      return Response.json({ status: "healthy", version: "3.0.0", time: new Date().toISOString() });
    } catch { throw new ApiError(503, "Database is not ready yet", "DATABASE_UNAVAILABLE"); }
  }
  if (/^\/api\/apps\/public\/prod\/public-settings\/by-id\/6a44dca7580bc27a93b13907$/.test(path) && method === "GET")
    return Response.json({ id: "6a44dca7580bc27a93b13907", public_settings: "public_without_login" });
  if (path === "/api/v1/public/business" && method === "GET") {
    const { businessSettings } = await import("../../db/staff-api.js");
    const settings = await businessSettings(getDb());
    return Response.json(Object.fromEntries(["company_name", "company_number", "phone", "email", "address", "hours"].map(k => [k, settings[k] || ""])));
  }
  const legacyJobList = /^\/api\/apps\/6a44dca7580bc27a93b13907\/entities\/JobListing$/.test(path);
  if ((path === "/api/v1/public/jobs" || legacyJobList) && method === "GET") {
    return Response.json(await getDb().select().from(schema.job_listings).where(eq(schema.job_listings.status, "active")).orderBy(desc(schema.job_listings.created_at)).limit(100));
  }
  const isLead = path === "/api/v1/public/leads" || path === "/api/apps/6a44dca7580bc27a93b13907/entities/Lead";
  const isApplication = path === "/api/v1/public/applications" || path === "/api/apps/6a44dca7580bc27a93b13907/entities/JobApplication";
  if ((isLead || isApplication) && method === "POST") {
    if (text(body.website)) return Response.json({ id: randomUUID(), ok: true, emailSent: false }, { status: 201 });
    const values = publicSubmission(body, isApplication), db = getDb();
    await rateLimit(db, context, "submission", 8);
    if (isApplication && values.job_id) {
      const [job] = await db.select().from(schema.job_listings).where(and(eq(schema.job_listings.id, values.job_id), eq(schema.job_listings.status, "active")));
      if (!job) throw new ApiError(400, "This job is no longer accepting applications");
      values.job_title = job.title;
    }
    const id = randomUUID(), ts = new Date().toISOString();
    await db.transaction(async tx => {
      await tx.insert(isApplication ? schema.job_applications : schema.leads).values({ ...values, id, created_at: ts, updated_at: ts } as any);
      await tx.insert(schema.notifications).values({ id: randomUUID(), type: isApplication ? "application" : "lead", title: isApplication ? "New job application" : "New contact request", message: values.full_name, link: isApplication ? "/crm#job_applications" : "/crm#leads", created_at: ts, updated_at: ts });
    });
    const emailSent = await sendMail(emailStatus().recipient, isApplication ? "New job application" : "New contact request", Object.entries(values).filter(([key]) => key !== "job_id").map(([key, value]) => `${key}: ${value}`).join("\n"));
    return Response.json({ id, ok: true, emailSent }, { status: 201 });
  }
  if (/^\/api\/app-logs\/6a44dca7580bc27a93b13907\/log-user-in-app\/[^/]+$/.test(path) && method === "POST") {
    const db = getDb();
    await rateLimit(db, context, "pageview", 120);
    await db.insert(schema.page_views).values({ page: decodeURIComponent(path.split("/").pop()!).slice(0, 60), created_at: new Date().toISOString() });
    return new Response(null, { status: 204 });
  }
  if ((path.endsWith("/analytics/track/batch") || path === "/api/v1/public/web-vitals") && method === "POST") return new Response(null, { status: 204 });
  if (path === "/api/csp-report" && method === "POST") return new Response(null, { status: 204 });
  if (path.startsWith("/api/v1/public/quotes/") || path.startsWith("/api/v1/public/portal/")) {
    const response = await publicCustomerRoutes(req, path, body, context);
    if (response) return response;
  }
  if (path === "/api/v1/auth/login" && method === "POST") {
    verifyRequestOrigin(req);
    await rateLimit(getDb(), context, "login", 12);
    await login(required(body.email, "Email", 254), required(body.password, "Password", 200));
    return Response.json({ ok: true });
  }
  if (path === "/api/v1/auth/refresh" && method === "POST") {
    verifyRequestOrigin(req);
    if (!await refreshSession()) throw new ApiError(401, "Please sign in again");
    return Response.json({ ok: true });
  }
  if (path === "/api/v1/auth/logout" && method === "POST") {
    verifyRequestOrigin(req);
    await logout();
    return new Response(null, { status: 204 });
  }
  if (path === "/api/v1/auth/password/forgot" && method === "POST") {
    verifyRequestOrigin(req);
    const email = required(body.email, "Email", 254);
    await rateLimit(getDb(), context, "recovery", 5);
    try { await requestPasswordRecovery(email); } catch (error) {
      if ((error as any)?.status >= 500) throw new ApiError(503, "Password recovery is temporarily unavailable");
    }
    return Response.json({ ok: true });
  }
  if (["/api/v1/auth/password/reset", "/api/v1/auth/users/accept-invite", "/api/v1/auth/confirm"].includes(path) && method === "POST") {
    verifyRequestOrigin(req);
    const token = required(body.token, "Confirmation", 4096);
    await rateLimit(getDb(), context, "verify", 12);
    if (path.endsWith("/confirm")) await confirmEmail(token);
    else {
      const password = required(body.password, "Password", 200);
      if (password.length < 10) throw new ApiError(400, "Password must contain at least 10 characters");
      if (path.endsWith("accept-invite")) await acceptInvite(token, password);
      else await recoverPassword(token, password);
    }
    return Response.json({ ok: true });
  }

  // All remaining routes require a verified Identity session and a staff role.
  let account = await getUser();
  if (!account && req.headers.get("cookie")?.includes("nf_refresh=")) {
    await refreshSession();
    account = await getUser();
  }
  if (!account) throw new ApiError(401, "Please sign in to continue", "AUTH_REQUIRED");
  const roles = account.roles || [], role = ["admin", "super_admin", "administrator", "manager", "accountant", "hr", "employee", "read_only"].find(r => roles.includes(r));
  if (!role) throw new ApiError(403, "Your account needs a staff role. Ask the site owner to grant access in Netlify Identity.", "STAFF_ACCESS_REQUIRED");
  if (!["GET", "HEAD"].includes(method)) verifyRequestOrigin(req);
  const db = getDb(), ts = new Date().toISOString();
  const user = { id: account.id, name: account.name || account.email || "Staff", email: account.email || "", role: role === "admin" ? "administrator" : role, role_id: Object.keys(permissions).indexOf(role) + 1, verified: 1, created_at: ts, updated_at: ts };
  await db.insert(schema.users).values(user).onConflictDoUpdate({ target: schema.users.id, set: { name: user.name, email: user.email, role: user.role, role_id: user.role_id, updated_at: ts } });
  const staff = { ...user, permissions: permissions[role], twoFactorEnabled: false };
  if ((path === "/api/v1/auth/me" || path === "/api/apps/6a44dca7580bc27a93b13907/entities/User/me") && method === "GET") return Response.json(staff);
  const response = await staffRoutes(req, path, body, staff, db, context);
  if (response) return response;
  throw new ApiError(404, "API endpoint not found", "NOT_FOUND");
}

export default async (req: Request, context: Context) => {
  try {
    const response = await handle(req, context);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
  } catch (error) {
    const e = error as any;
    const dbCode = e.code || e.cause?.code;
    let status = error instanceof ApiError ? error.status : e.status || 500;
    let message = error instanceof ApiError ? error.message : "The request could not be completed. Please try again.";
    if (dbCode === "23505") { status = 409; message = "A record with these details already exists"; }
    if (["23503", "23502", "22P02", "22003"].includes(dbCode)) { status = 400; message = "Check required fields and related records"; }
    if (status === 401) message = "Invalid credentials or expired session. Please sign in again.";
    if (!(status >= 400 && status <= 599)) status = 500;
    // Never log request bodies, identity responses, or connection details.
    if (status >= 500) console.error("API request failed", { requestId: context.requestId, path: new URL(req.url).pathname, code: error instanceof ApiError ? error.code : "INTERNAL_ERROR" });
    return Response.json({ error: { code: error instanceof ApiError ? error.code : "REQUEST_ERROR", message } }, { status, headers: { "Cache-Control": "no-store" } });
  }
};

export const config: Config = { path: "/api/*" };
