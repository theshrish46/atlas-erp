CREATE TYPE "public"."document_counter_type" AS ENUM('vendor', 'purchase_order', 'goods_received_note', 'purchase_invoice', 'purchase_payment', 'customer', 'quotation', 'sales_order', 'sales_invoice', 'sales_payment', 'inventory_adjustment');--> statement-breakpoint
CREATE TABLE "document_counters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"document_type" "document_counter_type" NOT NULL,
	"current_value" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_counters" ADD CONSTRAINT "document_counters_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "document_counters_company_document_unique" ON "document_counters" USING btree ("company_id","document_type");