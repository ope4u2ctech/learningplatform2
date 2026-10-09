import { z } from 'zod'
import { eq, sql } from 'drizzle-orm'
import type { Config } from '@netlify/functions'
import { getDb } from '../../db/index'
import { attempts, topicProgress, achievements } from '../../db/schema'
import { questions, spotterQuestion } from '../../src/lib/learning-content'
import { topics } from '../../src/lib/types'
import { ensureProfile, failure, json, requireUser } from '../lib/auth'

const submission = z.object({
  requestId: z.uuid(),
  mode: z.enum(['mcqs', 'spotters', 'notes']),
  topic: z.enum(topics),
  answers: z.array(z.object({ questionId: z.string().max(80), choice: z.number().int().min(0).max(3) })).max(20),
}).strict()

export default async (request: Request) => {
  if (request.method !== 'POST') return new Response(null, { status: 405 })
  try {
    const user = await requireUser(request)
    const input = submission.parse(await request.json())
    await ensureProfile(user)
    const bank = input.mode === 'spotters' ? [spotterQuestion] : questions.filter(question => question.topic === input.topic)
    if ((input.mode === 'notes' && input.answers.length !== 0) || (input.mode !== 'notes' && (input.answers.length === 0 || new Set(input.answers.map(answer => answer.questionId)).size !== input.answers.length || input.answers.some(answer => !bank.some(question => question.id === answer.questionId && question.topic === input.topic))))) return json({ error: 'Please submit a valid practice session.' }, 400)
    const results = input.answers.map(answer => {
      const question = bank.find(question => question.id === answer.questionId)!
      return { questionId: question.id, correct: answer.choice === question.answer, answer: question.answer, explanation: question.explanation }
    })
    const total = results.length
    const correct = results.filter(result => result.correct).length
    const database = getDb()
    await database.transaction(async transaction => {
      const inserted = await transaction.insert(attempts).values({ id: input.requestId, userId: user.id, topic: input.topic, mode: input.mode, total, correct, answers: { responses: input.answers } }).onConflictDoNothing().returning({ id: attempts.id })
      if (!inserted.length) return
      await transaction.insert(topicProgress).values({ userId: user.id, topic: input.topic, sessions: 1, total, correct }).onConflictDoUpdate({
        target: [topicProgress.userId, topicProgress.topic],
        set: { sessions: sql`${topicProgress.sessions} + 1`, total: sql`${topicProgress.total} + ${total}`, correct: sql`${topicProgress.correct} + ${correct}`, lastStudiedAt: new Date() },
      })
      await transaction.insert(achievements).values({ userId: user.id, code: 'first-session', name: 'First steps', description: 'Completed your first anatomy study session.' }).onConflictDoNothing()
      if (total >= 3 && correct === total) await transaction.insert(achievements).values({ userId: user.id, code: 'perfect-session', name: 'Sharp mind', description: 'Answered every question in a practice session correctly.' }).onConflictDoNothing()
      const [count] = await transaction.select({ total: sql<number>`coalesce(sum(${attempts.correct}), 0)::int` }).from(attempts).where(eq(attempts.userId, user.id))
      if (count.total >= 50) await transaction.insert(achievements).values({ userId: user.id, code: 'fifty-correct', name: 'Building foundations', description: 'Answered 50 anatomy questions correctly.' }).onConflictDoNothing()
    })
    return json({ total, correct, results })
  } catch (error) { return failure(error) }
}

export const config: Config = { path: '/api/attempts' }
