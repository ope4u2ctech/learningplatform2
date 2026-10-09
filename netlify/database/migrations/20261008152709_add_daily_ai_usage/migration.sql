CREATE TABLE "ai_daily_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"requests" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "ai_usage_user_date_idx" ON "ai_daily_usage" ("user_id","date");--> statement-breakpoint
ALTER TABLE "ai_daily_usage" ADD CONSTRAINT "ai_daily_usage_user_id_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE;