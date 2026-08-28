ALTER TABLE "department" RENAME TO "departments";--> statement-breakpoint
ALTER TABLE "companies" RENAME COLUMN "company_slug" TO "slug";--> statement-breakpoint
ALTER TABLE "departments" DROP CONSTRAINT "department_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "employee_departments" DROP CONSTRAINT "employee_departments_department_id_department_id_fk";
--> statement-breakpoint
DROP INDEX "department_company_name_unique";--> statement-breakpoint
DROP INDEX "companies_slug_unique";--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "website" varchar(255);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "gst_number" varchar(15);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "pan_number" varchar(10);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "country" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "state" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "city" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "postal_code" varchar(20);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "timezone" varchar(50) DEFAULT 'Asia/Kolkata' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "subscription_plan" "subscription_plan" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "subscription_status" "subscription_status" DEFAULT 'trialing' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_departments" ADD CONSTRAINT "employee_departments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "companies_name_idx" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "departments_company_name_unique" ON "departments" USING btree ("company_id","name");--> statement-breakpoint
CREATE INDEX "departments_company_idx" ON "departments" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_slug_unique" ON "companies" USING btree ("slug");