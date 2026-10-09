import { admin, AuthError } from '@netlify/identity'
import { z } from 'zod'
import type { Config } from '@netlify/functions'
import { failure, json, requireUser, roleOf } from '../lib/auth'

export default async (request: Request) => {
  try {
    const user = await requireUser(request)
    if (roleOf(user) !== 'administrator') throw new AuthError('Administrator access is required.', 403)
    if (request.method === 'GET') {
      const users = await admin.listUsers({ perPage: 100 })
      return json(users.map(account => ({ id: account.id, name: account.name, email: account.email, role: roleOf(account), requestedRole: account.userMetadata?.requested_role ?? 'student' })))
    }
    if (request.method !== 'PUT') return new Response(null, { status: 405 })
    const input = z.object({ userId: z.uuid(), role: z.enum(['student', 'lecturer', 'administrator']) }).strict().parse(await request.json())
    if (input.userId === user.id) return json({ error: 'You cannot change your own administrator role.' }, 400)
    const target = await admin.getUser(input.userId)
    await admin.updateUser(input.userId, { app_metadata: { ...target.appMetadata, roles: [input.role] } })
    return json({ success: true })
  } catch (error) { return failure(error) }
}

export const config: Config = { path: '/api/admin' }
