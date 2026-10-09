import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@netlify/identity'
import { api } from './api'
import type { Profile } from './types'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  ready: boolean
  profileLoading: boolean
  error: string | null
  recovery: boolean
  dark: boolean
  reloadProfile: () => Promise<Profile | null>
  saveProfile: (updates: Partial<Profile>) => Promise<Profile>
  signIn: (email: string, password: string, remember: boolean) => Promise<Profile>
  signOut: () => Promise<void>
  toggleTheme: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function renewRememberedSession() {
  if (!document.cookie.split('; ').includes('anatomy_remember=1')) return
  for (const name of ['nf_jwt', 'nf_refresh']) {
    const value = document.cookie.split('; ').find(cookie => cookie.startsWith(`${name}=`))
    if (value) document.cookie = `${value}; path=/; max-age=2592000; secure; samesite=lax`
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ready, setReady] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recovery, setRecovery] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    let active = true
    let unsubscribe: (() => void) | undefined
    async function initialize() {
      try {
        const identity = await import('@netlify/identity')
        unsubscribe = identity.onAuthChange((event, nextUser) => {
          if (!active) return
          setUser(nextUser)
          if (event === 'logout') { setProfile(null); setError(null); setRecovery(false); sessionStorage.removeItem('anatomy_recovery') }
          else renewRememberedSession()
        })
        const callback = await identity.handleAuthCallback()
        if (!active) return
        if (callback?.type === 'recovery' || callback?.type === 'invite') {
          if (callback.type === 'invite') {
            setError('Please ask your administrator to send a registration invitation, or create an account using your invited email.')
          } else {
            sessionStorage.setItem('anatomy_recovery', '1')
            setRecovery(true)
            if (window.location.pathname !== '/reset-password') { window.location.replace('/reset-password'); return }
          }
        }
        setRecovery(sessionStorage.getItem('anatomy_recovery') === '1')
        const current = callback?.user ?? await identity.getUser()
        if (active) setUser(current ?? null)
        if (callback?.type === 'confirmation' || callback?.type === 'oauth') {
          const account = await api<Profile>('profile')
          window.location.replace(account.onboardingComplete ? '/dashboard' : '/onboarding')
          return
        }
      } catch {
        if (active) setError('This sign-in link could not be processed. It may have expired. Please request a new link or sign in again.')
      } finally { if (active) setReady(true) }
    }
    void initialize()
    return () => { active = false; unsubscribe?.() }
  }, [])

  useEffect(() => {
    let active = true
    if (!user) { setProfile(null); setProfileLoading(false); return }
    setProfileLoading(true)
    setError(null)
    api<Profile>('profile').then(account => {
      if (active) { setProfile(account); setDark(account.theme === 'dark') }
    }).catch(() => {
      if (active) setError('Your profile could not be loaded. Please retry; your account is still signed in.')
    }).finally(() => { if (active) setProfileLoading(false) })
    return () => { active = false }
  }, [user?.id])

  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  async function reloadProfile() {
    if (!user) return null
    setProfileLoading(true)
    try {
      const account = await api<Profile>('profile')
      setProfile(account)
      setError(null)
      return account
    } finally { setProfileLoading(false) }
  }

  async function saveProfile(updates: Partial<Profile>) {
    if (!profile) throw new Error('Please wait for your profile to load.')
    const merged = { ...profile, ...updates }
    const { fullName, university, faculty, department, level, course, interests, preferredMode, requestedRole, dailyGoal, theme } = merged
    const account = await api<Profile>('profile', { method: 'PUT', body: JSON.stringify({ fullName, university, faculty, department, level, course, interests, preferredMode, requestedRole, dailyGoal, theme }) })
    setProfile(account)
    return account
  }

  async function signIn(email: string, password: string, remember: boolean) {
    document.cookie = `anatomy_remember=${remember ? '1' : '0'}; path=/; ${remember ? 'max-age=2592000;' : ''} secure; samesite=lax`
    const identity = await import('@netlify/identity')
    const account = await identity.login(email, password)
    setUser(account)
    renewRememberedSession()
    const accountProfile = await api<Profile>('profile')
    setProfile(accountProfile)
    return accountProfile
  }

  async function signOut() {
    const identity = await import('@netlify/identity')
    await identity.logout()
    document.cookie = 'anatomy_remember=; path=/; max-age=0; secure; samesite=lax'
    sessionStorage.removeItem('anatomy_recovery')
    setUser(null)
    setProfile(null)
    window.location.replace('/login')
  }

  function toggleTheme() {
    const next = !dark
    setDark(next)
    if (profile?.onboardingComplete) void saveProfile({ theme: next ? 'dark' : 'light' }).catch(() => setError('Your theme changed, but the preference could not be saved.'))
  }

  return <AuthContext.Provider value={{ user, profile, ready, profileLoading, error, recovery, dark, reloadProfile, saveProfile, signIn, signOut, toggleTheme }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
