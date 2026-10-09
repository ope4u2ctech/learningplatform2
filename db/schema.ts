import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, index, uniqueIndex } from 'drizzle-orm/pg-core'
import type { Role, StudyMode } from '../src/lib/types'
import type { Difficulty, QuestionType, SessionKind, VivaTurn } from '../src/lib/curriculum'

export const profiles = pgTable('profiles', {
  userId: text('user_id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  university: text('university').notNull().default(''),
  faculty: text('faculty').notNull().default(''),
  department: text('department').notNull().default(''),
  level: text('level').notNull().default('100L'),
  requestedRole: text('requested_role').$type<Role>().notNull().default('student'),
  course: text('course').notNull().default('MBBS'),
  interests: jsonb('interests').$type<string[]>().notNull().default([]),
  preferredMode: text('preferred_mode').$type<StudyMode>().notNull().default('mcqs'),
  avatarKey: text('avatar_key'),
  onboardingComplete: boolean('onboarding_complete').notNull().default(false),
  dailyGoal: integer('daily_goal').notNull().default(20),
  theme: text('theme').$type<'light' | 'dark'>().notNull().default('light'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const attempts = pgTable('study_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  mode: text('mode').$type<StudyMode>().notNull(),
  topic: text('topic').notNull(),
  total: integer('total').notNull(),
  correct: integer('correct').notNull(),
  answers: jsonb('answers').$type<Record<string, unknown>>().notNull().default({}),
  feedback: text('feedback'),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('attempts_user_date_idx').on(table.userId, table.completedAt)])

export const topicProgress = pgTable('topic_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  topic: text('topic').notNull(),
  sessions: integer('sessions').notNull().default(0),
  total: integer('total').notNull().default(0),
  correct: integer('correct').notNull().default(0),
  lastStudiedAt: timestamp('last_studied_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('topic_progress_user_topic_idx').on(table.userId, table.topic)])

export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  earnedAt: timestamp('earned_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('achievements_user_code_idx').on(table.userId, table.code)])

export const tutorMessages = pgTable('tutor_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  role: text('role').$type<'user' | 'assistant'>().notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('tutor_messages_user_date_idx').on(table.userId, table.createdAt)])

export const aiUsage = pgTable('ai_daily_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  requests: integer('requests').notNull().default(1),
}, (table) => [uniqueIndex('ai_usage_user_date_idx').on(table.userId, table.date)])

// Shared, continuously growing question bank. Starter items are curated; AI items are generated on demand and by schedule.
export const questionBank = pgTable('question_bank', {
  id: uuid('id').primaryKey().defaultRandom(),
  fingerprint: text('fingerprint').notNull(),
  subject: text('subject').notNull(),
  region: text('region').notNull(),
  topic: text('topic').notNull(),
  subtopic: text('subtopic').notNull(),
  type: text('type').$type<QuestionType>().notNull(),
  difficulty: text('difficulty').$type<Difficulty>().notNull(),
  stem: text('stem').notNull(),
  options: jsonb('options').$type<string[]>().notNull().default([]),
  correct: jsonb('correct').$type<number[]>().notNull().default([]),
  explanation: text('explanation').notNull(),
  distractorRationale: jsonb('distractor_rationale').$type<string[]>().notNull().default([]),
  clinicalCorrelation: text('clinical_correlation').notNull(),
  learningObjective: text('learning_objective').notNull(),
  keyPoints: jsonb('key_points').$type<string[]>().notNull().default([]),
  spotterCategory: text('spotter_category'),
  specimen: text('specimen'),
  imagePrompt: text('image_prompt'),
  imageKey: text('image_key'),
  source: text('source').$type<'starter' | 'ai'>().notNull().default('ai'),
  status: text('status').$type<'active' | 'retired'>().notNull().default('active'),
  reports: integer('reports').notNull().default(0),
  servedCount: integer('served_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('question_bank_fingerprint_idx').on(table.fingerprint),
  index('question_bank_scope_idx').on(table.subject, table.topic, table.type, table.difficulty),
  index('question_bank_topic_subtopic_idx').on(table.topic, table.subtopic),
])

export const questionReports = pgTable('question_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questionBank.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('question_reports_user_question_idx').on(table.userId, table.questionId)])

// A practice set, mock exam, review, or spotter circuit. Items store the shuffled option order so grading stays on the server.
export const assessmentSessions = pgTable('assessment_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  kind: text('kind').$type<SessionKind>().notNull(),
  label: text('label').notNull(),
  items: jsonb('items').$type<{ questionId: string; order: number[] }[]>().notNull(),
  filters: jsonb('filters').$type<Record<string, unknown>>().notNull().default({}),
  signature: text('signature').notNull(),
  durationSeconds: integer('duration_seconds'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  total: integer('total').notNull().default(0),
  correct: integer('correct').notNull().default(0),
  result: jsonb('result').$type<Record<string, unknown>>(),
}, (table) => [index('assessment_sessions_user_date_idx').on(table.userId, table.startedAt)])

export const questionResponses = pgTable('question_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').notNull().references(() => assessmentSessions.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questionBank.id, { onDelete: 'cascade' }),
  subject: text('subject').notNull(),
  topic: text('topic').notNull(),
  subtopic: text('subtopic').notNull(),
  type: text('type').$type<QuestionType>().notNull(),
  difficulty: text('difficulty').$type<Difficulty>().notNull(),
  correct: boolean('correct').notNull(),
  selected: jsonb('selected').$type<number[]>().notNull().default([]),
  timeMs: integer('time_ms').notNull().default(0),
  answeredAt: timestamp('answered_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('question_responses_session_question_idx').on(table.sessionId, table.questionId),
  index('question_responses_user_date_idx').on(table.userId, table.answeredAt),
  index('question_responses_user_concept_idx').on(table.userId, table.topic, table.subtopic),
])

// Spaced repetition: one row per student and concept (topic + subtopic). A null due date means the concept graduated.
export const reviewSchedule = pgTable('review_schedule', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  conceptKey: text('concept_key').notNull(),
  subject: text('subject').notNull(),
  topic: text('topic').notNull(),
  subtopic: text('subtopic').notNull(),
  stage: integer('stage').notNull().default(0),
  dueAt: timestamp('due_at', { withTimezone: true }),
  lapses: integer('lapses').notNull().default(0),
  reviews: integer('reviews').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('review_schedule_user_concept_idx').on(table.userId, table.conceptKey),
  index('review_schedule_user_due_idx').on(table.userId, table.dueAt),
])

export const vivaSessions = pgTable('viva_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  subject: text('subject').notNull(),
  topic: text('topic').notNull(),
  subtopic: text('subtopic').notNull(),
  difficulty: text('difficulty').$type<Difficulty>().notNull(),
  turns: jsonb('turns').$type<VivaTurn[]>().notNull().default([]),
  status: text('status').$type<'active' | 'completed'>().notNull().default('active'),
  averageScore: integer('average_score'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('viva_sessions_user_date_idx').on(table.userId, table.updatedAt)])
