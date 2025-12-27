ALTER TABLE "sessions" ALTER COLUMN "revoked_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "revoked_at" DROP NOT NULL;