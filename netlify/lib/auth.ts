import { AuthError, getUser, verifyRequestOrigin, type User } from '@netlify/identity'
import { ZodError } from 'zod'
import { eq } from 'drizzle-orm'
import { getDb } from '../../db/index'
import { profiles } from '../../db/schema'
import type { Role } from '../../src/lib/types'

export function roleOf(user: User): Role {
  const roles = user.roles ?? []
  if (roles.includes('administrator') || roles.includes('admin') || user.role === 'admin') return 'administrator'
  if (roles.includes('lecturer')) return 'lecturer'
  return 'student'
}

export async function requireUser(request: Request) {
  if (request.method !== 'GET') verifyRequestOrigin(request)
  const user = await getUser()
  if (!user) throw new AuthError('Please sign in to continue.', 401)
  return user
}

export async function ensureProfile(user: User) {
  const database = getDb()
  const metadata = user.userMetadata ?? {}
  const stringValue = (key: string, fallback = '') => typeof metadata[key] === 'string' ? String(metadata[key]).slice(0, 200) : fallback
  await database.insert(profiles).values({
    userId: user.id,
    email: user.email ?? '',
    fullName: user.name ?? stringValue('full_name', 'Learner'),
    university: stringValue('university'),
    faculty: stringValue('faculty'),
    department: stringValue('department'),
    level: stringValue('level', '100L'),
    requestedRole: ['student', 'lecturer', 'administrator'].includes(stringValue('requested_role')) ? stringValue('requested_role') as Role : 'student',
  }).onConflictDoNothing()
  const [profile] = await database.select().from(profiles).where(eq(profiles.userId, user.id))
  return { ...profile, email: user.email ?? profile.email, role: roleOf(user) }
}

export function failure(error: unknown) {
  if (error instanceof ZodError) return Response.json({ error: error.issues[0]?.message ?? 'Please check your details.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
  if (error instanceof AuthError) return Response.json({ error: error.status === 403 ? 'You do not have permission to perform this action.' : error.message }, { status: error.status ?? 401, headers: { 'Cache-Control': 'no-store' } })
  return Response.json({ error: 'The service is temporarily unavailable. Please try again shortly.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
}
