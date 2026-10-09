CREATE TABLE "assessment_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"kind" text NOT NULL,
	"label" text NOT NULL,
	"items" jsonb NOT NULL,
	"filters" jsonb DEFAULT '{}' NOT NULL,
	"signature" text NOT NULL,
	"duration_seconds" integer,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"total" integer DEFAULT 0 NOT NULL,
	"correct" integer DEFAULT 0 NOT NULL,
	"result" jsonb
);
--> statement-breakpoint
CREATE TABLE "question_bank" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"fingerprint" text NOT NULL,
	"subject" text NOT NULL,
	"region" text NOT NULL,
	"topic" text NOT NULL,
	"subtopic" text NOT NULL,
	"type" text NOT NULL,
	"difficulty" text NOT NULL,
	"stem" text NOT NULL,
	"options" jsonb DEFAULT '[]' NOT NULL,
	"correct" jsonb DEFAULT '[]' NOT NULL,
	"explanation" text NOT NULL,
	"distractor_rationale" jsonb DEFAULT '[]' NOT NULL,
	"clinical_correlation" text NOT NULL,
	"learning_objective" text NOT NULL,
	"key_points" jsonb DEFAULT '[]' NOT NULL,
	"spotter_category" text,
	"specimen" text,
	"image_prompt" text,
	"image_key" text,
	"source" text DEFAULT 'ai' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"reports" integer DEFAULT 0 NOT NULL,
	"served_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"session_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"topic" text NOT NULL,
	"subtopic" text NOT NULL,
	"type" text NOT NULL,
	"difficulty" text NOT NULL,
	"correct" boolean NOT NULL,
	"selected" jsonb DEFAULT '[]' NOT NULL,
	"time_ms" integer DEFAULT 0 NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_schedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"concept_key" text NOT NULL,
	"subject" text NOT NULL,
	"topic" text NOT NULL,
	"subtopic" text NOT NULL,
	"stage" integer DEFAULT 0 NOT NULL,
	"due_at" timestamp with time zone,
	"lapses" integer DEFAULT 0 NOT NULL,
	"reviews" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "viva_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"subject" text NOT NULL,
	"topic" text NOT NULL,
	"subtopic" text NOT NULL,
	"difficulty" text NOT NULL,
	"turns" jsonb DEFAULT '[]' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"average_score" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "assessment_sessions_user_date_idx" ON "assessment_sessions" ("user_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "question_bank_fingerprint_idx" ON "question_bank" ("fingerprint");--> statement-breakpoint
CREATE INDEX "question_bank_scope_idx" ON "question_bank" ("subject","topic","type","difficulty");--> statement-breakpoint
CREATE INDEX "question_bank_topic_subtopic_idx" ON "question_bank" ("topic","subtopic");--> statement-breakpoint
CREATE UNIQUE INDEX "question_reports_user_question_idx" ON "question_reports" ("user_id","question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "question_responses_session_question_idx" ON "question_responses" ("session_id","question_id");--> statement-breakpoint
CREATE INDEX "question_responses_user_date_idx" ON "question_responses" ("user_id","answered_at");--> statement-breakpoint
CREATE INDEX "question_responses_user_concept_idx" ON "question_responses" ("user_id","topic","subtopic");--> statement-breakpoint
CREATE UNIQUE INDEX "review_schedule_user_concept_idx" ON "review_schedule" ("user_id","concept_key");--> statement-breakpoint
CREATE INDEX "review_schedule_user_due_idx" ON "review_schedule" ("user_id","due_at");--> statement-breakpoint
CREATE INDEX "viva_sessions_user_date_idx" ON "viva_sessions" ("user_id","updated_at");--> statement-breakpoint
ALTER TABLE "assessment_sessions" ADD CONSTRAINT "assessment_sessions_user_id_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_user_id_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_question_id_question_bank_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question_bank"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_user_id_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_session_id_assessment_sessions_id_fkey" FOREIGN KEY ("session_id") REFERENCES "assessment_sessions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_question_id_question_bank_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question_bank"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "review_schedule" ADD CONSTRAINT "review_schedule_user_id_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "viva_sessions" ADD CONSTRAINT "viva_sessions_user_id_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE;