CREATE TABLE "activities" (
	"id" text PRIMARY KEY,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"activity_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"user_id" text,
	"metadata" text DEFAULT '{}',
	"occurred_at" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approval_requests" (
	"id" text PRIMARY KEY,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"action" text NOT NULL,
	"requested_by" text NOT NULL,
	"assigned_role" text DEFAULT 'administrator',
	"status" text DEFAULT 'pending',
	"amount" double precision,
	"reason" text,
	"decision_notes" text,
	"decided_by" text,
	"decided_at" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY,
	"customer_id" text,
	"asset_tag" text UNIQUE,
	"name" text NOT NULL,
	"category" text,
	"manufacturer" text,
	"model" text,
	"serial_number" text,
	"location" text,
	"status" text DEFAULT 'active',
	"installed_at" text,
	"warranty_until" text,
	"next_service_at" text,
	"notes" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" text PRIMARY KEY,
	"employee_id" text NOT NULL,
	"date" text NOT NULL,
	"check_in" text,
	"check_out" text,
	"status" text DEFAULT 'present',
	"notes" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "attendance_employee_id_date_unique" UNIQUE("employee_id","date")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY,
	"user_id" text,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"before_data" text,
	"after_data" text,
	"ip" text,
	"device" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_rules" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"entity_type" text NOT NULL,
	"trigger_event" text NOT NULL,
	"conditions" text DEFAULT '{}',
	"actions" text DEFAULT '[]',
	"active" integer DEFAULT 1,
	"last_run_at" text,
	"run_count" integer DEFAULT 0,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "backup_runs" (
	"id" text PRIMARY KEY,
	"filename" text NOT NULL,
	"size" integer DEFAULT 0,
	"status" text NOT NULL,
	"checksum" text,
	"error" text,
	"created_at" text NOT NULL,
	"completed_at" text
);
--> statement-breakpoint
CREATE TABLE "bank_accounts" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"bank" text,
	"account_number" text,
	"balance" double precision DEFAULT 0,
	"currency" text DEFAULT 'ILS',
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_settings" (
	"key" text PRIMARY KEY,
	"value" text NOT NULL,
	"category" text DEFAULT 'general',
	"updated_by" text,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"event_type" text DEFAULT 'meeting',
	"start_at" text NOT NULL,
	"end_at" text,
	"all_day" integer DEFAULT 0,
	"location" text,
	"description" text,
	"customer_id" text,
	"project_id" text,
	"assigned_to" text,
	"reminder_minutes" integer DEFAULT 30,
	"status" text DEFAULT 'scheduled',
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communications" (
	"id" text PRIMARY KEY,
	"customer_id" text,
	"lead_id" text,
	"type" text NOT NULL,
	"subject" text,
	"content" text,
	"occurred_at" text NOT NULL,
	"user_id" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_contacts" (
	"id" text PRIMARY KEY,
	"customer_id" text NOT NULL,
	"name" text NOT NULL,
	"title" text,
	"email" text,
	"phone" text,
	"primary_contact" integer DEFAULT 0,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY,
	"company_name" text NOT NULL,
	"contact_name" text,
	"email" text,
	"phone" text,
	"address" text,
	"status" text DEFAULT 'active',
	"owner_id" text,
	"tags" text DEFAULT '[]',
	"notes" text,
	"custom_fields" text DEFAULT '{}',
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"portal_token" text UNIQUE
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"customer_id" text,
	"lead_id" text,
	"value" double precision DEFAULT 0,
	"stage" text DEFAULT 'qualification',
	"probability" integer DEFAULT 20,
	"expected_close" text,
	"owner_id" text,
	"notes" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"manager_id" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"stored_name" text,
	"mime_type" text,
	"size" integer DEFAULT 0,
	"entity_type" text,
	"entity_id" text,
	"access_role" text DEFAULT 'employee',
	"uploaded_by" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" text PRIMARY KEY,
	"employee_number" text UNIQUE,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text,
	"department_id" text,
	"position" text,
	"salary" double precision DEFAULT 0,
	"status" text DEFAULT 'active',
	"hire_date" text,
	"vacation_days" double precision DEFAULT 0,
	"sick_days" double precision DEFAULT 0,
	"performance_notes" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_versions" (
	"id" text PRIMARY KEY,
	"document_id" text NOT NULL,
	"version" integer NOT NULL,
	"stored_name" text NOT NULL,
	"size" integer NOT NULL,
	"checksum" text NOT NULL,
	"uploaded_by" text,
	"created_at" text NOT NULL,
	CONSTRAINT "file_versions_document_id_version_unique" UNIQUE("document_id","version")
);
--> statement-breakpoint
CREATE TABLE "integration_jobs" (
	"id" text PRIMARY KEY,
	"provider" text NOT NULL,
	"job_type" text NOT NULL,
	"payload" text NOT NULL,
	"status" text DEFAULT 'queued',
	"attempts" integer DEFAULT 0,
	"scheduled_at" text NOT NULL,
	"completed_at" text,
	"last_error" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" text PRIMARY KEY,
	"invoice_id" text NOT NULL,
	"description" text NOT NULL,
	"quantity" double precision DEFAULT 1,
	"unit_price" double precision DEFAULT 0,
	"total" double precision DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY,
	"number" text NOT NULL UNIQUE,
	"customer_id" text,
	"issue_date" text NOT NULL,
	"due_date" text,
	"subtotal" double precision DEFAULT 0,
	"vat_rate" double precision DEFAULT 17,
	"vat_amount" double precision DEFAULT 0,
	"total" double precision DEFAULT 0,
	"status" text DEFAULT 'draft',
	"paid_at" text,
	"notes" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" text PRIMARY KEY,
	"job_id" text,
	"job_title" text,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text,
	"experience" text,
	"status" text DEFAULT 'pending',
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_listings" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"location" text,
	"category" text,
	"employment_type" text,
	"salary_range" text,
	"description" text,
	"requirements" text,
	"status" text DEFAULT 'active',
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" text PRIMARY KEY,
	"full_name" text NOT NULL,
	"company" text,
	"email" text,
	"phone" text,
	"source" text DEFAULT 'website',
	"score" integer DEFAULT 0,
	"stage" text DEFAULT 'new',
	"service_type" text,
	"owner_id" text,
	"follow_up_at" text,
	"message" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_requests" (
	"id" text PRIMARY KEY,
	"employee_id" text NOT NULL,
	"leave_type" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"days" double precision DEFAULT 1,
	"reason" text,
	"status" text DEFAULT 'pending',
	"approved_by" text,
	"decided_at" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" text PRIMARY KEY,
	"project_id" text NOT NULL,
	"title" text NOT NULL,
	"due_date" text,
	"completed" integer DEFAULT 0,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monitoring_events" (
	"id" text PRIMARY KEY,
	"level" text NOT NULL,
	"source" text NOT NULL,
	"event_type" text NOT NULL,
	"message" text NOT NULL,
	"metadata" text DEFAULT '{}',
	"resolved_at" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY,
	"user_id" text,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text,
	"link" text,
	"read_at" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY,
	"page" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll" (
	"id" text PRIMARY KEY,
	"employee_id" text NOT NULL,
	"month" text NOT NULL,
	"base_salary" double precision DEFAULT 0,
	"bonuses" double precision DEFAULT 0,
	"deductions" double precision DEFAULT 0,
	"tax" double precision DEFAULT 0,
	"net_salary" double precision DEFAULT 0,
	"status" text DEFAULT 'draft',
	"paid_at" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"customer_id" text,
	"manager_id" text,
	"status" text DEFAULT 'planning',
	"start_date" text,
	"deadline" text,
	"progress" integer DEFAULT 0,
	"budget" double precision DEFAULT 0,
	"spent" double precision DEFAULT 0,
	"description" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_integrations" (
	"id" text PRIMARY KEY,
	"provider" text NOT NULL UNIQUE,
	"category" text NOT NULL,
	"mode" text DEFAULT 'sandbox',
	"status" text DEFAULT 'not_configured',
	"settings" text DEFAULT '{}',
	"last_sync_at" text,
	"last_error" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_items" (
	"id" text PRIMARY KEY,
	"quote_id" text NOT NULL,
	"description" text NOT NULL,
	"quantity" double precision DEFAULT 1 NOT NULL,
	"unit_price" double precision DEFAULT 0 NOT NULL,
	"total" double precision DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" text PRIMARY KEY,
	"number" text NOT NULL UNIQUE,
	"customer_id" text,
	"lead_id" text,
	"title" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"subtotal" double precision DEFAULT 0 NOT NULL,
	"vat_rate" double precision DEFAULT 17 NOT NULL,
	"vat_amount" double precision DEFAULT 0 NOT NULL,
	"total" double precision DEFAULT 0 NOT NULL,
	"valid_until" text,
	"notes" text,
	"public_token" text NOT NULL UNIQUE,
	"viewed_at" text,
	"accepted_at" text,
	"signed_name" text,
	"signed_ip" text,
	"converted_invoice_id" text,
	"created_by" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "request_limits" (
	"key" text PRIMARY KEY,
	"hits" integer DEFAULT 1 NOT NULL,
	"expires_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_requests" (
	"id" text PRIMARY KEY,
	"number" text NOT NULL UNIQUE,
	"customer_id" text NOT NULL,
	"contact_name" text,
	"contact_email" text,
	"title" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'general',
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'open',
	"assigned_to" text,
	"source" text DEFAULT 'crm',
	"sla_due_at" text,
	"resolved_at" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"description" text,
	"project_id" text,
	"customer_id" text,
	"assigned_to" text,
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'todo',
	"due_date" text,
	"progress" integer DEFAULT 0,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" text PRIMARY KEY,
	"employee_id" text NOT NULL,
	"work_order_id" text,
	"project_id" text,
	"started_at" text NOT NULL,
	"ended_at" text,
	"minutes" integer DEFAULT 0,
	"entry_type" text DEFAULT 'work',
	"approved_by" text,
	"approved_at" text,
	"notes" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY,
	"type" text NOT NULL,
	"category" text,
	"amount" double precision NOT NULL,
	"date" text NOT NULL,
	"description" text,
	"customer_id" text,
	"project_id" text,
	"bank_account_id" text,
	"recurring" integer DEFAULT 0,
	"vat_rate" double precision DEFAULT 17,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"role_id" integer NOT NULL,
	"verified" integer DEFAULT 1,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"role" text DEFAULT 'read_only' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_order_updates" (
	"id" text PRIMARY KEY,
	"work_order_id" text NOT NULL,
	"update_type" text NOT NULL,
	"note" text,
	"document_id" text,
	"actor_id" text,
	"metadata" text DEFAULT '{}',
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" text PRIMARY KEY,
	"number" text NOT NULL UNIQUE,
	"customer_id" text,
	"project_id" text,
	"service_request_id" text,
	"asset_id" text,
	"title" text NOT NULL,
	"description" text,
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'scheduled',
	"assigned_employee_id" text,
	"scheduled_start" text,
	"scheduled_end" text,
	"check_in_at" text,
	"check_in_lat" double precision,
	"check_in_lng" double precision,
	"check_out_at" text,
	"check_out_lat" double precision,
	"check_out_lng" double precision,
	"resolution" text,
	"customer_signature" text,
	"completed_at" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_requested_by_users_id_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_decided_by_users_id_fkey" FOREIGN KEY ("decided_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_employees_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_updated_by_users_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_assigned_to_users_id_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "communications" ADD CONSTRAINT "communications_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "communications" ADD CONSTRAINT "communications_lead_id_leads_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id");--> statement-breakpoint
ALTER TABLE "communications" ADD CONSTRAINT "communications_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_lead_id_leads_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id");--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id");--> statement-breakpoint
ALTER TABLE "file_versions" ADD CONSTRAINT "file_versions_document_id_documents_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "file_versions" ADD CONSTRAINT "file_versions_uploaded_by_users_id_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_job_listings_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job_listings"("id");--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_id_employees_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id");--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approved_by_users_id_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_employee_id_employees_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_manager_id_users_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_quotes_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_lead_id_leads_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id");--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_converted_invoice_id_invoices_id_fkey" FOREIGN KEY ("converted_invoice_id") REFERENCES "invoices"("id");--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_assigned_to_users_id_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_employee_id_employees_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id");--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_work_order_id_work_orders_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id");--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_approved_by_users_id_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_bank_account_id_bank_accounts_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id");--> statement-breakpoint
ALTER TABLE "work_order_updates" ADD CONSTRAINT "work_order_updates_work_order_id_work_orders_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "work_order_updates" ADD CONSTRAINT "work_order_updates_document_id_documents_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id");--> statement-breakpoint
ALTER TABLE "work_order_updates" ADD CONSTRAINT "work_order_updates_actor_id_users_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_service_request_id_service_requests_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id");--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_asset_id_assets_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id");--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_assigned_employee_id_employees_id_fkey" FOREIGN KEY ("assigned_employee_id") REFERENCES "employees"("id");