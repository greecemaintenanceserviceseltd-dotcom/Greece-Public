export class ApiError extends Error {
  constructor(public status: number, message: string, public code = "REQUEST_ERROR") {
    super(message);
  }
}

export function text(value: unknown, max = 2000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function required(value: unknown, label: string, max = 120) {
  const result = text(value, max);
  if (!result) throw new ApiError(400, `${label} is required`);
  return result;
}

export function publicSubmission(body: Record<string, unknown>, application = false) {
  const full_name = required(body.full_name, "Name");
  const phone = required(body.phone, "Phone", 40);
  if (!/^[+()\d\s.-]{5,40}$/.test(phone)) throw new ApiError(400, "Enter a valid phone number");
  const email = text(body.email, 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, "Enter a valid email address");
  return application
    ? { full_name, phone, email, job_id: text(body.job_id, 100) || null, job_title: text(body.job_title, 200), experience: text(body.experience, 5000), status: "pending" }
    : { full_name, phone, email, company: text(body.company, 200), service_type: text(body.service_type, 100), message: text(body.message, 5000), source: "website", stage: "new", score: 20 };
}

export function moneyTotals(subtotal: unknown, vatRate: unknown) {
  const amount = Number(subtotal ?? 0), rate = Number(vatRate ?? 17);
  if (!Number.isFinite(amount) || !Number.isFinite(rate) || amount < 0 || rate < 0 || rate > 100)
    throw new ApiError(400, "Subtotal and VAT must be valid non-negative amounts");
  const vat_amount = Math.round(amount * rate) / 100;
  return { subtotal: amount, vat_rate: rate, vat_amount, total: Math.round((amount + vat_amount) * 100) / 100 };
}

export function csvValue(value: unknown) {
  let cell = String(value ?? "");
  if (/^[=+@\-\t\r]/.test(cell)) cell = "'" + cell;
  return '"' + cell.replaceAll('"', '""') + '"';
}

export function newNumber(prefix: string) {
  return `${prefix}-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export const permissions: Record<string, string[]> = {
  admin: ["*"], super_admin: ["*"], administrator: ["*"],
  manager: ["dashboard.read", "crm.*", "projects.*", "tasks.*", "employees.read"],
  accountant: ["dashboard.read", "finance.*", "invoices.*", "reports.finance"],
  hr: ["dashboard.read", "hr.*", "employees.*", "payroll.*"],
  employee: ["tasks.read", "tasks.update", "projects.read"],
  read_only: ["*.read"],
};

export function can(granted: string[], needed: string) {
  return granted.some((p) => p === "*" || p === needed || (p === "*.read" && needed.endsWith(".read")) || (p.endsWith(".*") && needed.startsWith(p.slice(0, -1))));
}
