ALTER TABLE "email_verification_tokens" ALTER COLUMN "token_hash" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "token_hash" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ALTER COLUMN "token_hash" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "token_hash" SET DATA TYPE text;