import { z } from 'zod'
import { eq } from 'drizzle-orm'
import type { Config } from '@netlify/functions'
import { getDb } from '../../db/index'
import { profiles } from '../../db/schema'
import { courses, levels, topics } from '../../src/lib/types'
import { ensureProfile, failure, json, requireUser } from '../lib/auth'

const profileUpdate = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name.').max(120),
  university: z.string().trim().min(2, 'Please enter your university.').max(200),
  faculty: z.string().trim().min(2, 'Please enter your faculty.').max(200),
  department: z.string().trim().min(2, 'Please enter your department.').max(200),
  level: z.enum(levels),
  course: z.enum(courses),
  interests: z.array(z.enum(topics)).min(1, 'Choose at least one area of interest.').max(5),
  preferredMode: z.enum(['mcqs', 'spotters', 'viva', 'notes', 'ai-tutor']),
  requestedRole: z.enum(['student', 'lecturer', 'administrator']).optional(),
  dailyGoal: z.number().int().min(5).max(100).optional(),
  theme: z.enum(['light', 'dark']).optional(),
}).strict()

export default async (request: Request) => {
  try {
    const user = await requireUser(request)
    if (request.method === 'GET') return json(await ensureProfile(user))
    if (request.method !== 'PUT') return new Response(null, { status: 405, headers: { Allow: 'GET, PUT' } })
    const input = profileUpdate.parse(await request.json())
    await ensureProfile(user)
    await getDb().update(profiles).set({ ...input, onboardingComplete: true, updatedAt: new Date() }).where(eq(profiles.userId, user.id))
    return json(await ensureProfile(user))
  } catch (error) { return failure(error) }
}

export const config: Config = { path: '/api/profile' }
