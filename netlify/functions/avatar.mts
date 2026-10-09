import { getStore } from '@netlify/blobs'
import { eq } from 'drizzle-orm'
import type { Config } from '@netlify/functions'
import { getDb } from '../../db/index'
import { profiles } from '../../db/schema'
import { ensureProfile, failure, json, requireUser } from '../lib/auth'

export default async (request: Request) => {
  try {
    const user = await requireUser(request)
    const profile = await ensureProfile(user)
    const store = getStore({ name: 'profile-pictures', consistency: 'strong' })
    if (request.method === 'GET') {
      if (!profile.avatarKey) return new Response(null, { status: 404 })
      const data = await store.get(profile.avatarKey, { type: 'arrayBuffer' })
      if (!data) return new Response(null, { status: 404 })
      const type = profile.avatarKey.endsWith('.png') ? 'image/png' : profile.avatarKey.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
      return new Response(data, { headers: { 'Content-Type': type, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } })
    }
    if (request.method !== 'POST') return new Response(null, { status: 405 })
    const file = (await request.formData()).get('picture')
    if (!(file instanceof File) || file.size === 0 || file.size > 2 * 1024 * 1024) return json({ error: 'Choose a JPG, PNG, or WebP image under 2 MB.' }, 400)
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    const isWebp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
    if (!isPng && !isJpeg && !isWebp) return json({ error: 'That file is not a supported image. Please choose a JPG, PNG, or WebP.' }, 400)
    const key = `${user.id}/${crypto.randomUUID()}.${isPng ? 'png' : isWebp ? 'webp' : 'jpg'}`
    await store.set(key, buffer)
    await getDb().update(profiles).set({ avatarKey: key, updatedAt: new Date() }).where(eq(profiles.userId, user.id))
    if (profile.avatarKey) await store.delete(profile.avatarKey).catch(() => {})
    return json({ avatarKey: key })
  } catch (error) { return failure(error) }
}

export const config: Config = { path: '/api/avatar' }
