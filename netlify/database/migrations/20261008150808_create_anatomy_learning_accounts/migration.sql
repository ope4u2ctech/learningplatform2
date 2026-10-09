CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"mode" text NOT NULL,
	"topic" text NOT NULL,
	"total" integer NOT NULL,
	"correct" integer NOT NULL,
	"answers" jsonb DEFAULT '{}' NOT NULL,
	"feedback" text,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"university" text DEFAULT '' NOT NULL,
	"faculty" text DEFAULT '' NOT NULL,
	"department" text DEFAULT '' NOT NULL,
	"level" text DEFAULT '100L' NOT NULL,
	"requested_role" text DEFAULT 'student' NOT NULL,
	"course" text DEFAULT 'MBBS' NOT NULL,
	"interests" jsonb DEFAULT '[]' NOT NULL,
	"preferred_mode" text DEFAULT 'mcqs' NOT NULL,
	"avatar_key" text,
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"daily_goal" integer DEFAULT 20 NOT NULL,
	"theme" text DEFAULT 'light' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"topic" text NOT NULL,
	"sessions" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"correct" integer DEFAULT 0 NOT NULL,
	"last_studied_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "achievements_user_code_idx" ON "achievements" ("user_id","code");--> statement-breakpoint
CREATE INDEX "attempts_user_date_idx" ON "study_attempts" ("user_id","completed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "topic_progress_user_topic_idx" ON "topic_progress" ("user_id","topic");--> statement-breakpoint
CREATE INDEX "tutor_messages_user_date_idx" ON "tutor_messages" ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "study_attempts" ADD CONSTRAINT "study_attempts_user_id_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "topic_progress" ADD CONSTRAINT "topic_progress_user_id_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tutor_messages" ADD CONSTRAINT "tutor_messages_user_id_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE;