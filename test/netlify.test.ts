import test from "node:test";
import assert from "node:assert/strict";
import { ApiError, can, csvValue, moneyTotals, permissions, publicSubmission } from "../db/validation.js";
import { cleanFields } from "../db/staff-api.js";
import * as schema from "../db/schema.js";
import { documentPdf } from "../db/pdf.js";
import api, { readBody } from "../netlify/functions/api.mts";

test("public submissions validate required fields and email before persistence", () => {
  assert.throws(() => publicSubmission({ full_name: " ", phone: "0501234567" }), ApiError);
  assert.throws(() => publicSubmission({ full_name: "Test", phone: "abcde" }), ApiError);
  assert.throws(() => publicSubmission({ full_name: "Test", phone: "0501234567", email: "invalid" }), ApiError);
});

test("public clients cannot grant themselves CRM ownership or application status", () => {
  const lead = publicSubmission({ full_name: "Test", phone: "0501234567", owner_id: "attacker", stage: "won", score: 999 });
  assert.equal(lead.stage, "new");
  assert.equal(lead.score, 20);
  assert.equal("owner_id" in lead, false);
  const application = publicSubmission({ full_name: "Test", phone: "0501234567", status: "hired" }, true);
  assert.equal(application.status, "pending");
});

test("staff field cleaning prevents changing IDs, dates and private portal links", () => {
  const values = cleanFields(schema.customers, { id: "other", created_at: "yesterday", portal_token: "forged", company_name: " Company " }, ["company_name"]);
  assert.deepEqual(values, { company_name: "Company" });
});

test("numeric fields reject non-finite numbers and fractional integers", () => {
  assert.throws(() => cleanFields(schema.tasks, { progress: "Infinity" }, ["progress"]), ApiError);
  assert.throws(() => cleanFields(schema.tasks, { progress: 1.5 }, ["progress"]), ApiError);
  assert.deepEqual(cleanFields(schema.tasks, { project_id: "", progress: "50" }, ["project_id", "progress"]), { project_id: null, progress: 50 });
});

test("financial totals are calculated by the server", () => {
  assert.deepEqual(moneyTotals(120.55, 17), { subtotal: 120.55, vat_rate: 17, vat_amount: 20.49, total: 141.04 });
  for (const amount of [-1, NaN, Infinity]) assert.throws(() => moneyTotals(amount, 17), ApiError);
  assert.throws(() => moneyTotals(100, 101), ApiError);
});

test("role checks prevent employees from reading finance or unapproved accounts from reading anything", () => {
  assert.equal(can(permissions.employee, "finance.read"), false);
  assert.equal(can(permissions.employee, "tasks.update"), true);
  assert.equal(can(permissions.employee, "tasks.delete"), false);
  assert.equal(can(permissions.manager, "payroll.read"), false);
  assert.equal(can([], "crm.read"), false);
  assert.equal(can(permissions.admin, "settings.update"), true);
  assert.equal(can(permissions.read_only, "crm.delete"), false);
});

test("CSV exports neutralize spreadsheet formulas and escape quotes", () => {
  assert.equal(csvValue('=HYPERLINK("bad")'), '"\'=HYPERLINK(""bad"")"');
  assert.equal(csvValue('a,b'), '"a,b"');
});

test("request parser rejects arrays, malformed JSON, and large bodies", async () => {
  for (const value of ["[]", "null", "broken"]) await assert.rejects(readBody(new Request("https://example.test/api", { method: "POST", body: value })), ApiError);
  await assert.rejects(readBody(new Request("https://example.test/api", { method: "POST", headers: { "Content-Length": "6000000" }, body: "{}" })), ApiError);
});

test("invalid public form requests return JSON errors before opening the database", async () => {
  const result = await api(new Request("https://example.test/api/v1/public/leads", { method: "POST", body: JSON.stringify({ full_name: "", phone: "" }) }), { requestId: "test" } as any);
  assert.equal(result.status, 400);
  assert.equal(result.headers.get("cache-control"), "no-store");
  assert.match((await result.json()).error.message, /Name is required/);
});

test("the public frontend can initialize independently of authentication", async () => {
  const result = await api(new Request("https://example.test/api/apps/public/prod/public-settings/by-id/6a44dca7580bc27a93b13907"), { requestId: "test" } as any);
  assert.equal(result.status, 200);
  assert.equal((await result.json()).public_settings, "public_without_login");
});

test("private CRM requests reject unauthenticated callers", async () => {
  const result = await api(new Request("https://example.test/api/v1/leads"), { requestId: "test" } as any);
  assert.equal(result.status, 401);
  assert.equal((await result.json()).error.code, "AUTH_REQUIRED");
});

test("PDF generation produces a downloadable document with packaged fonts", async () => {
  const bytes = await documentPdf("Invoice", { number: "TEST-1", subtotal: 100, vat_amount: 17, total: 117 }, [], { company_name: "Test company" });
  assert.equal(bytes.subarray(0, 4).toString(), "%PDF");
  assert.ok(bytes.length > 1000);
});
