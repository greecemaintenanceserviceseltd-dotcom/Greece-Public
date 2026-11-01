import { and, eq, ne, desc } from "drizzle-orm";
import type { Context } from "@netlify/functions";
import { randomUUID } from "node:crypto";
import { getDb } from "./index.js";
import * as schema from "./schema.js";
import { ApiError, newNumber, required, text } from "./validation.js";
import { businessSettings, lookup } from "./staff-api.js";
import { documentPdf, download } from "./pdf.js";

function publicQuote(q: any) {
  const { id, number, title, status, subtotal, vat_rate, vat_amount, total, valid_until, notes, viewed_at, accepted_at, signed_name } = q;
  return { id, number, title, status, subtotal, vat_rate, vat_amount, total, valid_until, notes, viewed_at, accepted_at, signed_name };
}

export async function publicCustomerRoutes(req: Request, path: string, body: any, context: Context): Promise<Response | null> {
  const db = getDb(), p = path.replace("/api/v1/public/", "").split("/"), ts = new Date().toISOString();
  const token = p[1];
  if (!token || token.length > 100) throw new ApiError(404, "Link not found");
  if (p[0] === "quotes") {
    if (req.method === "GET" && !p[2]) {
      const [q] = await db.select().from(schema.quotes).where(eq(schema.quotes.public_token, token)).limit(1);
      if (!q) throw new ApiError(404, "Quote not found");
      if (!q.viewed_at) await db.update(schema.quotes).set({ viewed_at: ts }).where(eq(schema.quotes.id, q.id));
      const items = await db.select({ description: schema.quote_items.description, quantity: schema.quote_items.quantity, unit_price: schema.quote_items.unit_price, total: schema.quote_items.total }).from(schema.quote_items).where(eq(schema.quote_items.quote_id, q.id));
      const company = await businessSettings(db);
      const customer = q.customer_id ? await lookup(db, schema.customers, q.customer_id) : {};
      return Response.json({ quote: { ...publicQuote(q), company_name: customer.company_name || "", contact_name: customer.contact_name || "" }, items, company: { name: company.company_name, phone: company.phone, email: company.email } });
    }
    if (req.method === "POST" && ["accept", "reject"].includes(p[2])) {
      const signed_name = p[2] === "accept" ? required(body.signed_name, "Full name", 120) : null;
      return db.transaction(async tx => {
        const [q] = await tx.select().from(schema.quotes).where(eq(schema.quotes.public_token, token)).for("update");
        if (!q) throw new ApiError(404, "Quote not found");
        if (!["draft", "sent"].includes(q.status)) throw new ApiError(409, "This quote has already been finalized");
        if (q.valid_until && q.valid_until < ts.slice(0, 10)) throw new ApiError(410, "This quote has expired");
        await tx.update(schema.quotes).set({ status: p[2] === "accept" ? "accepted" : "rejected", signed_name, signed_ip: p[2] === "accept" ? context.ip : null, accepted_at: p[2] === "accept" ? ts : null, updated_at: ts }).where(eq(schema.quotes.id, q.id));
        await tx.insert(schema.notifications).values({ id: randomUUID(), type: "quote", title: p[2] === "accept" ? "Quote accepted" : "Quote rejected", message: q.number, link: "/crm#quotes", created_at: ts, updated_at: ts });
        return Response.json({ ok: true });
      });
    }
    throw new ApiError(405, "Method not allowed");
  }
  if (p[0] === "portal") {
    const [customer] = await db.select().from(schema.customers).where(eq(schema.customers.portal_token, token)).limit(1);
    if (!customer) throw new ApiError(404, "Customer portal not found");
    const company = await businessSettings(db);
    if (req.method === "GET" && !p[2]) {
      const invoices = await db.select({ id: schema.invoices.id, number: schema.invoices.number, issue_date: schema.invoices.issue_date, due_date: schema.invoices.due_date, total: schema.invoices.total, status: schema.invoices.status }).from(schema.invoices).where(and(eq(schema.invoices.customer_id, customer.id), ne(schema.invoices.status, "draft"))).orderBy(desc(schema.invoices.created_at));
      const quotes = await db.select({ id: schema.quotes.id, number: schema.quotes.number, title: schema.quotes.title, total: schema.quotes.total, status: schema.quotes.status, public_token: schema.quotes.public_token }).from(schema.quotes).where(and(eq(schema.quotes.customer_id, customer.id), ne(schema.quotes.status, "draft")));
      const projects = await db.select({ id: schema.projects.id, name: schema.projects.name, status: schema.projects.status, progress: schema.projects.progress, deadline: schema.projects.deadline }).from(schema.projects).where(eq(schema.projects.customer_id, customer.id));
      const assets = await db.select({ id: schema.assets.id, name: schema.assets.name, asset_tag: schema.assets.asset_tag, status: schema.assets.status, next_service_at: schema.assets.next_service_at }).from(schema.assets).where(eq(schema.assets.customer_id, customer.id));
      const serviceRequests = await db.select({ id: schema.service_requests.id, number: schema.service_requests.number, title: schema.service_requests.title, status: schema.service_requests.status }).from(schema.service_requests).where(eq(schema.service_requests.customer_id, customer.id));
      const workOrders = await db.select({ id: schema.work_orders.id, number: schema.work_orders.number, title: schema.work_orders.title, status: schema.work_orders.status, scheduled_start: schema.work_orders.scheduled_start }).from(schema.work_orders).where(eq(schema.work_orders.customer_id, customer.id));
      return Response.json({ customer: { company_name: customer.company_name, contact_name: customer.contact_name }, invoices, quotes, projects, assets, serviceRequests, workOrders, company: { name: company.company_name, phone: company.phone, email: company.email } });
    }
    if (req.method === "POST" && p[2] === "service-requests") {
      const [row] = await db.insert(schema.service_requests).values({ id: randomUUID(), number: newNumber("SR"), customer_id: customer.id, contact_name: customer.contact_name, contact_email: customer.email, title: required(body.title, "Title", 200), description: text(body.description, 5000), source: "portal", created_at: ts, updated_at: ts }).returning();
      return Response.json({ id: row.id, number: row.number, status: row.status }, { status: 201 });
    }
    if (req.method === "GET" && p[2] === "invoices" && p[4] === "pdf") {
      const [invoice] = await db.select().from(schema.invoices).where(and(eq(schema.invoices.id, p[3]), eq(schema.invoices.customer_id, customer.id), ne(schema.invoices.status, "draft")));
      if (!invoice) throw new ApiError(404, "Invoice not found");
      const items = await db.select().from(schema.invoice_items).where(eq(schema.invoice_items.invoice_id, invoice.id));
      return download(await documentPdf("Invoice", { ...customer, ...invoice }, items, company), `${invoice.number}.pdf`, "application/pdf");
    }
    throw new ApiError(405, "Method not allowed");
  }
  return null;
}
