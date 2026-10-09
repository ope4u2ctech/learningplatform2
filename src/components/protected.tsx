import { useEffect, type ReactNode } from 'react'
import { LoaderCircle, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from './ui/button'

export function Protected({ children, onboarding = false, admin = false }: { children: ReactNode; onboarding?: boolean; admin?: boolean }) {
  const { user, profile, ready, profileLoading, error, reloadProfile } = useAuth()
  useEffect(() => {
    if (ready && !user) window.location.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)
    if (ready && profile && !onboarding && !profile.onboardingComplete) window.location.replace('/onboarding')
  }, [ready, user, profile, onboarding])
  if (!ready || !user || profileLoading || (profile && !onboarding && !profile.onboardingComplete)) return <div className="full-state" role="status"><LoaderCircle className="animate-spin text-primary" size={30} /><p>Getting your workspace ready…</p></div>
  if (!profile) return <div className="full-state"><ShieldAlert size={30} className="text-primary" /><h1>Let’s reconnect</h1><p role="alert">{error ?? 'Your profile is temporarily unavailable.'}</p><Button onClick={() => void reloadProfile().catch(() => {})}>Retry connection</Button><a href="/login">Back to sign in</a></div>
  if (admin && profile.role !== 'administrator') return <div className="full-state"><ShieldAlert size={30} /><h1>Administrator access required</h1><p>Your account does not have permission to view this page.</p><Button asChild><a href="/dashboard">Back to dashboard</a></Button></div>
  return children
}
