// Netlify Postgres schema; field names preserve the existing CRM API contract.
import { pgTable, text, integer, serial, doublePrecision, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role_id: integer("role_id").notNull(),
  verified: integer("verified").default(1),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
  role: text("role").notNull().default("read_only"),
});

export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  company_name: text("company_name").notNull(),
  contact_name: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  status: text("status").default("active"),
  owner_id: text("owner_id").references(() => users.id),
  tags: text("tags").default("[]"),
  notes: text("notes"),
  custom_fields: text("custom_fields").default("{}"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
  portal_token: text("portal_token").unique(),
});

export const leads = pgTable("leads", {
  id: text("id").primaryKey(),
  full_name: text("full_name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  source: text("source").default("website"),
  score: integer("score").default(0),
  stage: text("stage").default("new"),
  service_type: text("service_type"),
  owner_id: text("owner_id").references(() => users.id),
  follow_up_at: text("follow_up_at"),
  message: text("message"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const deals = pgTable("deals", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  customer_id: text("customer_id").references(() => customers.id),
  lead_id: text("lead_id").references(() => leads.id),
  value: doublePrecision("value").default(0),
  stage: text("stage").default("qualification"),
  probability: integer("probability").default(20),
  expected_close: text("expected_close"),
  owner_id: text("owner_id").references(() => users.id),
  notes: text("notes"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const communications = pgTable("communications", {
  id: text("id").primaryKey(),
  customer_id: text("customer_id").references(() => customers.id),
  lead_id: text("lead_id").references(() => leads.id),
  type: text("type").notNull(),
  subject: text("subject"),
  content: text("content"),
  occurred_at: text("occurred_at").notNull(),
  user_id: text("user_id").references(() => users.id),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const departments = pgTable("departments", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  manager_id: text("manager_id"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const employees = pgTable("employees", {
  id: text("id").primaryKey(),
  employee_number: text("employee_number").unique(),
  full_name: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  department_id: text("department_id").references(() => departments.id),
  position: text("position"),
  salary: doublePrecision("salary").default(0),
  status: text("status").default("active"),
  hire_date: text("hire_date"),
  vacation_days: doublePrecision("vacation_days").default(0),
  sick_days: doublePrecision("sick_days").default(0),
  performance_notes: text("performance_notes"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  employee_id: text("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  check_in: text("check_in"),
  check_out: text("check_out"),
  status: text("status").default("present"),
  notes: text("notes"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
}, (table) => [unique().on(table.employee_id,table.date)]);

export const payroll = pgTable("payroll", {
  id: text("id").primaryKey(),
  employee_id: text("employee_id").notNull().references(() => employees.id),
  month: text("month").notNull(),
  base_salary: doublePrecision("base_salary").default(0),
  bonuses: doublePrecision("bonuses").default(0),
  deductions: doublePrecision("deductions").default(0),
  tax: doublePrecision("tax").default(0),
  net_salary: doublePrecision("net_salary").default(0),
  status: text("status").default("draft"),
  paid_at: text("paid_at"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  customer_id: text("customer_id").references(() => customers.id),
  manager_id: text("manager_id").references(() => users.id),
  status: text("status").default("planning"),
  start_date: text("start_date"),
  deadline: text("deadline"),
  progress: integer("progress").default(0),
  budget: doublePrecision("budget").default(0),
  spent: doublePrecision("spent").default(0),
  description: text("description"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const milestones = pgTable("milestones", {
  id: text("id").primaryKey(),
  project_id: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  due_date: text("due_date"),
  completed: integer("completed").default(0),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  project_id: text("project_id").references(() => projects.id),
  customer_id: text("customer_id").references(() => customers.id),
  assigned_to: text("assigned_to").references(() => users.id),
  priority: text("priority").default("medium"),
  status: text("status").default("todo"),
  due_date: text("due_date"),
  progress: integer("progress").default(0),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const bank_accounts = pgTable("bank_accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  bank: text("bank"),
  account_number: text("account_number"),
  balance: doublePrecision("balance").default(0),
  currency: text("currency").default("ILS"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  category: text("category"),
  amount: doublePrecision("amount").notNull(),
  date: text("date").notNull(),
  description: text("description"),
  customer_id: text("customer_id").references(() => customers.id),
  project_id: text("project_id").references(() => projects.id),
  bank_account_id: text("bank_account_id").references(() => bank_accounts.id),
  recurring: integer("recurring").default(0),
  vat_rate: doublePrecision("vat_rate").default(17),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  customer_id: text("customer_id").references(() => customers.id),
  issue_date: text("issue_date").notNull(),
  due_date: text("due_date"),
  subtotal: doublePrecision("subtotal").default(0),
  vat_rate: doublePrecision("vat_rate").default(17),
  vat_amount: doublePrecision("vat_amount").default(0),
  total: doublePrecision("total").default(0),
  status: text("status").default("draft"),
  paid_at: text("paid_at"),
  notes: text("notes"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const invoice_items = pgTable("invoice_items", {
  id: text("id").primaryKey(),
  invoice_id: text("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: doublePrecision("quantity").default(1),
  unit_price: doublePrecision("unit_price").default(0),
  total: doublePrecision("total").default(0),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  user_id: text("user_id").references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  link: text("link"),
  read_at: text("read_at"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  stored_name: text("stored_name"),
  mime_type: text("mime_type"),
  size: integer("size").default(0),
  entity_type: text("entity_type"),
  entity_id: text("entity_id"),
  access_role: text("access_role").default("employee"),
  uploaded_by: text("uploaded_by").references(() => users.id),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const audit_logs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  user_id: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  entity_type: text("entity_type"),
  entity_id: text("entity_id"),
  before_data: text("before_data"),
  after_data: text("after_data"),
  ip: text("ip"),
  device: text("device"),
  created_at: text("created_at").notNull(),
});

export const job_listings = pgTable("job_listings", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  location: text("location"),
  category: text("category"),
  employment_type: text("employment_type"),
  salary_range: text("salary_range"),
  description: text("description"),
  requirements: text("requirements"),
  status: text("status").default("active"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const job_applications = pgTable("job_applications", {
  id: text("id").primaryKey(),
  job_id: text("job_id").references(() => job_listings.id),
  job_title: text("job_title"),
  full_name: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  experience: text("experience"),
  status: text("status").default("pending"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const business_settings = pgTable("business_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  category: text("category").default("general"),
  updated_by: text("updated_by").references(() => users.id),
  updated_at: text("updated_at").notNull(),
});

export const customer_contacts = pgTable("customer_contacts", {
  id: text("id").primaryKey(),
  customer_id: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  title: text("title"),
  email: text("email"),
  phone: text("phone"),
  primary_contact: integer("primary_contact").default(0),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const activities = pgTable("activities", {
  id: text("id").primaryKey(),
  entity_type: text("entity_type").notNull(),
  entity_id: text("entity_id").notNull(),
  activity_type: text("activity_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  user_id: text("user_id").references(() => users.id),
  metadata: text("metadata").default("{}"),
  occurred_at: text("occurred_at").notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const automation_rules = pgTable("automation_rules", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  entity_type: text("entity_type").notNull(),
  trigger_event: text("trigger_event").notNull(),
  conditions: text("conditions").default("{}"),
  actions: text("actions").default("[]"),
  active: integer("active").default(1),
  last_run_at: text("last_run_at"),
  run_count: integer("run_count").default(0),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const calendar_events = pgTable("calendar_events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  event_type: text("event_type").default("meeting"),
  start_at: text("start_at").notNull(),
  end_at: text("end_at"),
  all_day: integer("all_day").default(0),
  location: text("location"),
  description: text("description"),
  customer_id: text("customer_id").references(() => customers.id),
  project_id: text("project_id").references(() => projects.id),
  assigned_to: text("assigned_to").references(() => users.id),
  reminder_minutes: integer("reminder_minutes").default(30),
  status: text("status").default("scheduled"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const leave_requests = pgTable("leave_requests", {
  id: text("id").primaryKey(),
  employee_id: text("employee_id").notNull().references(() => employees.id),
  leave_type: text("leave_type").notNull(),
  start_date: text("start_date").notNull(),
  end_date: text("end_date").notNull(),
  days: doublePrecision("days").default(1),
  reason: text("reason"),
  status: text("status").default("pending"),
  approved_by: text("approved_by").references(() => users.id),
  decided_at: text("decided_at"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const approval_requests = pgTable("approval_requests", {
  id: text("id").primaryKey(),
  entity_type: text("entity_type").notNull(),
  entity_id: text("entity_id"),
  action: text("action").notNull(),
  requested_by: text("requested_by").notNull().references(() => users.id),
  assigned_role: text("assigned_role").default("administrator"),
  status: text("status").default("pending"),
  amount: doublePrecision("amount"),
  reason: text("reason"),
  decision_notes: text("decision_notes"),
  decided_by: text("decided_by").references(() => users.id),
  decided_at: text("decided_at"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const provider_integrations = pgTable("provider_integrations", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull().unique(),
  category: text("category").notNull(),
  mode: text("mode").default("sandbox"),
  status: text("status").default("not_configured"),
  settings: text("settings").default("{}"),
  last_sync_at: text("last_sync_at"),
  last_error: text("last_error"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const integration_jobs = pgTable("integration_jobs", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  job_type: text("job_type").notNull(),
  payload: text("payload").notNull(),
  status: text("status").default("queued"),
  attempts: integer("attempts").default(0),
  scheduled_at: text("scheduled_at").notNull(),
  completed_at: text("completed_at"),
  last_error: text("last_error"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const monitoring_events = pgTable("monitoring_events", {
  id: text("id").primaryKey(),
  level: text("level").notNull(),
  source: text("source").notNull(),
  event_type: text("event_type").notNull(),
  message: text("message").notNull(),
  metadata: text("metadata").default("{}"),
  resolved_at: text("resolved_at"),
  created_at: text("created_at").notNull(),
});

export const backup_runs = pgTable("backup_runs", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  size: integer("size").default(0),
  status: text("status").notNull(),
  checksum: text("checksum"),
  error: text("error"),
  created_at: text("created_at").notNull(),
  completed_at: text("completed_at"),
});

export const file_versions = pgTable("file_versions", {
  id: text("id").primaryKey(),
  document_id: text("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  stored_name: text("stored_name").notNull(),
  size: integer("size").notNull(),
  checksum: text("checksum").notNull(),
  uploaded_by: text("uploaded_by").references(() => users.id),
  created_at: text("created_at").notNull(),
}, (table) => [unique().on(table.document_id,table.version)]);

export const quotes = pgTable("quotes", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  customer_id: text("customer_id").references(() => customers.id),
  lead_id: text("lead_id").references(() => leads.id),
  title: text("title").notNull(),
  status: text("status").notNull().default("draft"),
  subtotal: doublePrecision("subtotal").notNull().default(0),
  vat_rate: doublePrecision("vat_rate").notNull().default(17),
  vat_amount: doublePrecision("vat_amount").notNull().default(0),
  total: doublePrecision("total").notNull().default(0),
  valid_until: text("valid_until"),
  notes: text("notes"),
  public_token: text("public_token").notNull().unique(),
  viewed_at: text("viewed_at"),
  accepted_at: text("accepted_at"),
  signed_name: text("signed_name"),
  signed_ip: text("signed_ip"),
  converted_invoice_id: text("converted_invoice_id").references(() => invoices.id),
  created_by: text("created_by").references(() => users.id),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const quote_items = pgTable("quote_items", {
  id: text("id").primaryKey(),
  quote_id: text("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: doublePrecision("quantity").notNull().default(1),
  unit_price: doublePrecision("unit_price").notNull().default(0),
  total: doublePrecision("total").notNull().default(0),
  sort_order: integer("sort_order").notNull().default(0),
});

export const page_views = pgTable("page_views", {
  id: serial("id").primaryKey(),
  page: text("page").notNull(),
  created_at: text("created_at").notNull(),
});

export const service_requests = pgTable("service_requests", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  customer_id: text("customer_id").notNull().references(() => customers.id),
  contact_name: text("contact_name"),
  contact_email: text("contact_email"),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").default("general"),
  priority: text("priority").default("medium"),
  status: text("status").default("open"),
  assigned_to: text("assigned_to").references(() => users.id),
  source: text("source").default("crm"),
  sla_due_at: text("sla_due_at"),
  resolved_at: text("resolved_at"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const assets = pgTable("assets", {
  id: text("id").primaryKey(),
  customer_id: text("customer_id").references(() => customers.id),
  asset_tag: text("asset_tag").unique(),
  name: text("name").notNull(),
  category: text("category"),
  manufacturer: text("manufacturer"),
  model: text("model"),
  serial_number: text("serial_number"),
  location: text("location"),
  status: text("status").default("active"),
  installed_at: text("installed_at"),
  warranty_until: text("warranty_until"),
  next_service_at: text("next_service_at"),
  notes: text("notes"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const work_orders = pgTable("work_orders", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  customer_id: text("customer_id").references(() => customers.id),
  project_id: text("project_id").references(() => projects.id),
  service_request_id: text("service_request_id").references(() => service_requests.id),
  asset_id: text("asset_id").references(() => assets.id),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").default("medium"),
  status: text("status").default("scheduled"),
  assigned_employee_id: text("assigned_employee_id").references(() => employees.id),
  scheduled_start: text("scheduled_start"),
  scheduled_end: text("scheduled_end"),
  check_in_at: text("check_in_at"),
  check_in_lat: doublePrecision("check_in_lat"),
  check_in_lng: doublePrecision("check_in_lng"),
  check_out_at: text("check_out_at"),
  check_out_lat: doublePrecision("check_out_lat"),
  check_out_lng: doublePrecision("check_out_lng"),
  resolution: text("resolution"),
  customer_signature: text("customer_signature"),
  completed_at: text("completed_at"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const work_order_updates = pgTable("work_order_updates", {
  id: text("id").primaryKey(),
  work_order_id: text("work_order_id").notNull().references(() => work_orders.id, { onDelete: "cascade" }),
  update_type: text("update_type").notNull(),
  note: text("note"),
  document_id: text("document_id").references(() => documents.id),
  actor_id: text("actor_id").references(() => users.id),
  metadata: text("metadata").default("{}"),
  created_at: text("created_at").notNull(),
});

export const time_entries = pgTable("time_entries", {
  id: text("id").primaryKey(),
  employee_id: text("employee_id").notNull().references(() => employees.id),
  work_order_id: text("work_order_id").references(() => work_orders.id),
  project_id: text("project_id").references(() => projects.id),
  started_at: text("started_at").notNull(),
  ended_at: text("ended_at"),
  minutes: integer("minutes").default(0),
  entry_type: text("entry_type").default("work"),
  approved_by: text("approved_by").references(() => users.id),
  approved_at: text("approved_at"),
  notes: text("notes"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const request_limits = pgTable("request_limits", {
  key: text("key").primaryKey(),
  hits: integer("hits").notNull().default(1),
  expires_at: text("expires_at").notNull(),
});
