export const modules: Record<string, {permission: string; search: string[]; fields: string[]}>={
 customers:{permission:'crm',search:['company_name','contact_name','email','phone'],fields:['company_name','contact_name','email','phone','address','status','owner_id','tags','notes','custom_fields']},
 leads:{permission:'crm',search:['full_name','company','email','phone'],fields:['full_name','company','email','phone','source','score','stage','service_type','owner_id','follow_up_at','message']},
 deals:{permission:'crm',search:['title','stage'],fields:['title','customer_id','lead_id','value','stage','probability','expected_close','owner_id','notes']},
 communications:{permission:'crm',search:['subject','content'],fields:['customer_id','lead_id','type','subject','content','occurred_at','user_id']},
 tasks:{permission:'tasks',search:['title','description'],fields:['title','description','project_id','customer_id','assigned_to','priority','status','due_date','progress']},
 departments:{permission:'hr',search:['name'],fields:['name','manager_id']},
 employees:{permission:'employees',search:['employee_number','full_name','email','phone','position'],fields:['employee_number','full_name','email','phone','department_id','position','salary','status','hire_date','vacation_days','sick_days','performance_notes']},
 attendance:{permission:'hr',search:['date','status'],fields:['employee_id','date','check_in','check_out','status','notes']},
 payroll:{permission:'payroll',search:['month','status'],fields:['employee_id','month','base_salary','bonuses','deductions','tax','net_salary','status','paid_at']},
 projects:{permission:'projects',search:['name','status','description'],fields:['name','customer_id','manager_id','status','start_date','deadline','progress','budget','spent','description']},
 milestones:{permission:'projects',search:['title'],fields:['project_id','title','due_date','completed']},
 transactions:{permission:'finance',search:['category','description'],fields:['type','category','amount','date','description','customer_id','project_id','bank_account_id','recurring','vat_rate']},
 bank_accounts:{permission:'finance',search:['name','bank','account_number'],fields:['name','bank','account_number','balance','currency']},
 invoices:{permission:'invoices',search:['number','status','notes'],fields:['number','customer_id','issue_date','due_date','subtotal','vat_rate','vat_amount','total','status','paid_at','notes']},
 notifications:{permission:'dashboard',search:['title','message'],fields:['user_id','type','title','message','link','read_at']},
 documents:{permission:'crm',search:['name','entity_type'],fields:['name','stored_name','mime_type','size','entity_type','entity_id','access_role','uploaded_by']},
 job_listings:{permission:'hr',search:['title','location','category'],fields:['title','location','category','employment_type','salary_range','description','requirements','status']},
 job_applications:{permission:'hr',search:['full_name','job_title','email','phone'],fields:['job_id','job_title','full_name','email','phone','experience','status']},
 users:{permission:'settings',search:['name','email'],fields:['name','email','role_id','verified']},
 audit_logs:{permission:'settings',search:['action','entity_type','entity_id'],fields:[]}
 ,calendar_events:{permission:'tasks',search:['title','location','description'],fields:['title','event_type','start_at','end_at','all_day','location','description','customer_id','project_id','assigned_to','reminder_minutes','status']}
 ,activities:{permission:'crm',search:['title','description','entity_type'],fields:['entity_type','entity_id','activity_type','title','description','user_id','metadata','occurred_at']}
 ,automation_rules:{permission:'settings',search:['name','entity_type','trigger_event'],fields:['name','entity_type','trigger_event','conditions','actions','active']}
 ,leave_requests:{permission:'hr',search:['leave_type','reason','status'],fields:['employee_id','leave_type','start_date','end_date','days','reason','status','approved_by','decided_at']}
 ,approval_requests:{permission:'settings',search:['entity_type','action','status','reason'],fields:['entity_type','entity_id','action','requested_by','assigned_role','status','amount','reason','decision_notes','decided_by','decided_at']}
 ,provider_integrations:{permission:'settings',search:['provider','category','status'],fields:['provider','category','mode','status','settings','last_sync_at','last_error']}
 ,monitoring_events:{permission:'settings',search:['source','event_type','message','level'],fields:['level','source','event_type','message','metadata','resolved_at']}
 ,assets:{permission:'crm',search:['name','asset_tag','serial_number','location'],fields:['customer_id','asset_tag','name','category','manufacturer','model','serial_number','location','status','installed_at','warranty_until','next_service_at','notes']}
 ,time_entries:{permission:'hr',search:['entry_type','notes'],fields:['employee_id','work_order_id','project_id','started_at','ended_at','minutes','entry_type','approved_by','approved_at','notes']}
 ,service_requests:{permission:'crm',search:['number','title','description'],fields:['number','customer_id','contact_name','contact_email','title','description','category','priority','status','assigned_to','source','sla_due_at','resolved_at']}
 ,work_orders:{permission:'projects',search:['number','title','description'],fields:['number','customer_id','project_id','service_request_id','asset_id','title','description','priority','status','assigned_employee_id','scheduled_start','scheduled_end','check_in_at','check_in_lat','check_in_lng','check_out_at','check_out_lat','check_out_lng','resolution','customer_signature','completed_at']}
 };

modules.quotes = { permission: "invoices", search: ["number", "title", "status"], fields: ["number", "title", "customer_id", "lead_id", "status", "subtotal", "vat_rate", "valid_until", "notes"] };
