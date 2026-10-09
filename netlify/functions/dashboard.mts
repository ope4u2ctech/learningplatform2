import { desc, eq } from 'drizzle-orm'
import type { Config } from '@netlify/functions'
import { getDb } from '../../db/index'
import { attempts, topicProgress, achievements } from '../../db/schema'
import { ensureProfile, failure, json, requireUser } from '../lib/auth'
import { summarize } from '../lib/analytics'

export default async (request: Request) => {
  if (request.method !== 'GET') return new Response(null, { status: 405 })
  try {
    const user = await requireUser(request)
    const profile = await ensureProfile(user)
    const database = getDb()
    const [history, progress, earned] = await Promise.all([
      database.select().from(attempts).where(eq(attempts.userId, user.id)).orderBy(desc(attempts.completedAt)),
      database.select().from(topicProgress).where(eq(topicProgress.userId, user.id)),
      database.select().from(achievements).where(eq(achievements.userId, user.id)).orderBy(desc(achievements.earnedAt)),
    ])
    return json(summarize(history.map(item => ({ ...item, completedAt: item.completedAt.toISOString() })), progress.map(item => ({ ...item, lastStudiedAt: item.lastStudiedAt.toISOString() })), earned.map(item => ({ ...item, earnedAt: item.earnedAt.toISOString() })), profile.interests))
  } catch (error) { return failure(error) }
}

export const config: Config = { path: '/api/dashboard' }
