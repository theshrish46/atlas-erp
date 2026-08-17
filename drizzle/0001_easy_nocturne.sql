CREATE TYPE "public"."company_size" AS ENUM('1-10', '11-50', '51-200', '201-500', '500+');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100),
	"entity_id" uuid,
	"metadata" jsonb,
	"ip_address" varchar(45),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "employee_departments" (
	"employee_id" uuid NOT NULL,
	"department_id" uuid NOT NULL,
	CONSTRAINT "employee_departments_employee_id_department_id_pk" PRIMARY KEY("employee_id","department_id")
);
--> statement-breakpoint
CREATE TABLE "employee_roles" (
	"employee_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	CONSTRAINT "employee_roles_employee_id_role_id_pk" PRIMARY KEY("employee_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"phone" varchar(20),
	"employee_code" varchar(50),
	"job_title" varchar(150),
	"joined_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mfa_factors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"secret_encrypted" text,
	"enabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_roles" CASCADE;--> statement-breakpoint
ALTER TABLE "refresh_tokens" RENAME TO "departments";--> statement-breakpoint
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "departments" DROP CONSTRAINT "refresh_tokens_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_company_id_companies_id_fk";
--> statement-breakpoint
DROP INDEX "invitations_company_id_idx";--> statement-breakpoint
DROP INDEX "permissions_module_action_idx";--> statement-breakpoint
DROP INDEX "permissions_module_idx";--> statement-breakpoint
DROP INDEX "refresh_tokens_token_idx";--> statement-breakpoint
DROP INDEX "refresh_tokens_user_id_idx";--> statement-breakpoint
DROP INDEX "role_permissions_permission_id_idx";--> statement-breakpoint
DROP INDEX "roles_company_id_idx";--> statement-breakpoint
DROP INDEX "roles_company_name_idx";--> statement-breakpoint
DROP INDEX "users_company_id_idx";--> statement-breakpoint
DROP INDEX "users_company_employee_code_idx";--> statement-breakpoint
DROP INDEX "invitations_token_idx";--> statement-breakpoint
DROP INDEX "users_email_idx";--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "country" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "state" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "city" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "role_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "token_hash" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "key" varchar(150) NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "company_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_departments" ADD CONSTRAINT "employee_departments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_departments" ADD CONSTRAINT "employee_departments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_roles" ADD CONSTRAINT "employee_roles_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_roles" ADD CONSTRAINT "employee_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_factors" ADD CONSTRAINT "mfa_factors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "employee_departments_employee_idx" ON "employee_departments" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "employee_departments_department_idx" ON "employee_departments" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "employee_roles_employee_idx" ON "employee_roles" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "employee_roles_role_idx" ON "employee_roles" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "employees_user_unique" ON "employees" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "employees_company_code_unique" ON "employees" USING btree ("company_id","employee_code");--> statement-breakpoint
CREATE INDEX "employees_company_idx" ON "employees" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "employees_user_idx" ON "employees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_token_idx" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_expires_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "companies_name_idx" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE INDEX "invitations_company_idx" ON "invitations" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_key_unique" ON "permissions" USING btree ("key");--> statement-breakpoint
CREATE INDEX "permissions_key_idx" ON "permissions" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "departments_company_name_unique" ON "departments" USING btree ("company_id","name");--> statement-breakpoint
CREATE INDEX "departments_company_idx" ON "departments" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "role_permissions_role_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_company_name_unique" ON "roles" USING btree ("company_id","name");--> statement-breakpoint
CREATE INDEX "roles_company_idx" ON "roles" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invitations_token_idx" ON "invitations" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
ALTER TABLE "invitations" DROP COLUMN "token";--> statement-breakpoint
ALTER TABLE "invitations" DROP COLUMN "accepted";--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN "module";--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN "action";--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "departments" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "departments" DROP COLUMN "token";--> statement-breakpoint
ALTER TABLE "departments" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "company_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "profile_image";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "designation";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "department";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "employee_code";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "email_verified";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_login";