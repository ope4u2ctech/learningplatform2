import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck, Sparkles, Sun, Moon } from 'lucide-react'
import { Brand } from './brand'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuth } from '@/lib/auth-context'
import { levels } from '@/lib/types'

export function Field({ label, children, hint, optional }: { label: string; children: ReactNode; hint?: string; optional?: boolean }) {
  return <label className="form-field"><span className="field-label">{label}{optional && <span>Optional</span>}</span>{children}{hint && <span className="field-hint">{hint}</span>}</label>
}

export function PasswordInput({ value, onChange, label = 'Password', confirm = false, strength = false }: { value: string; onChange: (value: string) => void; label?: string; confirm?: boolean; strength?: boolean }) {
  const [visible, setVisible] = useState(false)
  const score = [value.length >= 8, /[a-z]/.test(value) && /[A-Z]/.test(value), /\d/.test(value), /[^a-zA-Z0-9]/.test(value)].filter(Boolean).length
  return <div><Field label={label}><div className="password-input"><Input aria-label={label} type={visible ? 'text' : 'password'} autoComplete={confirm || strength ? 'new-password' : 'current-password'} placeholder={confirm ? 'Enter your password again' : strength ? 'Create a strong password' : 'Enter your password'} value={value} required minLength={8} maxLength={72} onChange={event => onChange(event.target.value)} /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field>{strength && value && <div className="password-strength"><div>{[1, 2, 3, 4].map(index => <span key={index} className={score >= index ? `strength-${score}` : ''} />)}</div><span>{['', 'Keep going', 'Getting stronger', 'Strong password', 'Very strong password'][score]}</span></div>}</div>
}

function GoogleIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.01v2.5h3.24c1.89-1.74 2.98-4.31 2.98-7.34Z" /><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.24-2.5c-.9.6-2.04.96-3.37.96-2.6 0-4.8-1.76-5.58-4.12H3.07v2.59A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.42 13.91A6 6 0 0 1 6.1 12c0-.66.11-1.3.32-1.91V7.5H3.07A10 10 0 0 0 2 12c0 1.61.38 3.14 1.07 4.5l3.35-2.59Z" /><path fill="#EA4335" d="M12 5.97c1.47 0 2.79.5 3.82 1.49l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.5l3.35 2.59A6 6 0 0 1 12 5.97Z" /></svg>
}

export function AuthLayout({ children, signup = false }: { children: ReactNode; signup?: boolean }) {
  const { dark, toggleTheme } = useAuth()
  return <div className="auth-page"><a href="#auth-form" className="skip-link">Skip to form</a><aside className="auth-story"><div className="auth-story-top"><Brand /><span className="auth-story-tag">YOUR LEARNING COMPANION</span></div><div className="auth-story-copy"><span className="hero-eyebrow"><Sparkles size={14} />MADE FOR CURIOUS MINDS</span><h2>A stronger foundation.<br />A brighter future.</h2><p>You bring the curiosity.<br />We’ll help you connect the dots.</p></div><div className="auth-anatomy-image"><img src="/.netlify/images?url=/img/anatomy-skeleton.png&w=1000&fm=webp" alt="An ivory anatomical skeleton with a soft violet halo" /></div><div className="auth-story-bottom"><div className="auth-feature"><ShieldCheck size={18} /><span>A secure space for your learning journey.</span></div><p>From your first lecture to your final viva.</p></div></aside><div className="auth-form-side"><header className="auth-topbar"><a href="/" className="auth-back"><ArrowLeft size={16} />Back to workspace</a><button className="icon-button" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button></header><main id="auth-form" className={`auth-form-content ${signup ? 'signup-content' : ''}`}>{children}</main><footer className="auth-footer"><LockKeyhole size={12} />Your learning journey. Your account. Always protected.</footer></div></div>
}

export function GoogleLogin({ onError }: { onError: (message: string) => void }) {
  const [busy, setBusy] = useState(false)
  async function googleLogin() {
    setBusy(true)
    try {
      const { getSettings, oauthLogin } = await import('@netlify/identity')
      const settings = await getSettings()
      if (!settings.providers.google) { onError('Google sign-in is not enabled yet. Please use your email and password for now.'); setBusy(false); return }
      await oauthLogin('google')
    } catch { onError('Google sign-in could not be started. Please try again or use your email.'); setBusy(false) }
  }
  return <Button type="button" variant="outline" className="w-full google-button" disabled={busy} onClick={() => void googleLogin()}>{busy ? <LoaderCircle className="animate-spin" /> : <GoogleIcon />}Continue with Google</Button>
}

export function FormError({ message }: { message: string | null }) {
  return message ? <div role="alert" className="form-error">{message}</div> : null
}

function validPassword(password: string) {
  return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)
}

export function LoginPage() {
  const { signIn, error: callbackError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [passwordChanged, setPasswordChanged] = useState(false)
  useEffect(() => { setPasswordChanged(new URLSearchParams(window.location.search).get('reset') === 'success') }, [])
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const profile = await signIn(email.trim(), password, remember)
      const next = new URLSearchParams(window.location.search).get('next')
      const safeNext = next && /^\/(dashboard|learn|progress|achievements|profile|settings|admin)(\/|\?|$)/.test(next) ? next : '/dashboard'
      window.location.assign(profile.onboardingComplete ? safeNext : '/onboarding')
    } catch (problem) {
      const { AuthError } = await import('@netlify/identity')
      setError(problem instanceof AuthError ? problem.status === 400 || problem.status === 401 ? 'The email or password is incorrect, or your email has not been verified. Please check your details.' : 'Sign-in is temporarily unavailable. Please try again.' : problem instanceof Error ? problem.message : 'Please try again.')
      setBusy(false)
    }
  }
  return <AuthLayout><div className="auth-heading-icon"><BookIcon /></div><span className="form-eyebrow">GOOD TO HAVE YOU HERE</span><h1>Welcome back.</h1><p className="auth-intro">Your next discovery is waiting. Let’s pick up where you left off.</p>{passwordChanged && <div className="form-success" role="status"><Check size={16} />Password updated. Sign in with your new password.</div>}<FormError message={error || callbackError} /><GoogleLogin onError={setError} /><div className="form-divider"><span>or sign in with email</span></div><form onSubmit={submit} className="auth-form"><Field label="Email address"><Input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@university.edu" required maxLength={254} /></Field><PasswordInput value={password} onChange={setPassword} /><div className="form-options"><label className="checkbox-label"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} />Remember me</label><a href="/forgot-password">Forgot password?</a></div><Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" /> : <>Sign in<ArrowRight /></>}</Button></form><p className="auth-switch">New to the journey? <a href="/signup">Create an account</a></p><div className="auth-welcome-note"><span className="status-dot" />Built for students. Designed for understanding.</div></AuthLayout>
}

function BookIcon() { return <Sparkles size={23} /> }

export function SignupPage() {
  const [step, setStep] = useState(1)
  const [fields, setFields] = useState({ fullName: '', email: '', university: '', faculty: '', department: '', level: '100L', requestedRole: 'student' })
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const change = (key: keyof typeof fields, value: string) => setFields(previous => ({ ...previous, [key]: value }))
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    if (!validPassword(password)) { setError('Use at least 8 characters, including an uppercase letter, a lowercase letter, and a number.'); setStep(1); return }
    if (password !== confirm) { setError('Your passwords do not match. Please check them.'); setStep(1); return }
    if (step === 1) { setStep(2); return }
    setBusy(true)
    try {
      const { signup } = await import('@netlify/identity')
      const account = await signup(fields.email.trim(), password, { full_name: fields.fullName.trim(), university: fields.university.trim(), faculty: fields.faculty.trim(), department: fields.department.trim(), level: fields.level, requested_role: fields.requestedRole })
      window.location.assign(account.confirmedAt ? '/onboarding' : '/verify-email')
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Your account could not be created. Please try again.'); setBusy(false) }
  }
  return <AuthLayout signup><span className="form-eyebrow">A NEW CHAPTER STARTS HERE</span><h1>Make room for discovery.</h1><p className="auth-intro">Create your account and build a study journey that’s yours.</p><div className="signup-steps"><span className={step === 1 ? 'current' : 'complete'}>{step > 1 ? <Check size={13} /> : '1'}<strong>Your account</strong></span><i /><span className={step === 2 ? 'current' : ''}>2<strong>Your university</strong></span></div><FormError message={error} />{step === 1 && <><GoogleLogin onError={setError} /><div className="form-divider"><span>or register with email</span></div></>}<form onSubmit={submit} className="auth-form">{step === 1 ? <><Field label="Full name"><Input autoComplete="name" placeholder="Your first and last name" required minLength={2} maxLength={120} value={fields.fullName} onChange={event => change('fullName', event.target.value)} /></Field><Field label="Email address"><Input type="email" autoComplete="email" placeholder="you@university.edu" required maxLength={254} value={fields.email} onChange={event => change('email', event.target.value)} /></Field><PasswordInput value={password} onChange={setPassword} strength /><PasswordInput label="Confirm password" value={confirm} onChange={setConfirm} confirm /><p className="field-hint password-rules">At least 8 characters, with uppercase, lowercase, and a number.</p></> : <><Field label="University"><Input autoComplete="organization" placeholder="e.g. University of Ilorin" required minLength={2} maxLength={200} value={fields.university} onChange={event => change('university', event.target.value)} /></Field><Field label="Faculty"><Input placeholder="e.g. College of Health Sciences" required minLength={2} maxLength={200} value={fields.faculty} onChange={event => change('faculty', event.target.value)} /></Field><div className="form-two-columns"><Field label="Department"><Input placeholder="e.g. Medicine" required minLength={2} maxLength={200} value={fields.department} onChange={event => change('department', event.target.value)} /></Field><Field label="Academic level"><select className="form-select" value={fields.level} onChange={event => change('level', event.target.value)}>{levels.map(level => <option key={level}>{level}</option>)}</select></Field></div><Field label="I’m joining as"><select className="form-select" value={fields.requestedRole} onChange={event => change('requestedRole', event.target.value)}><option value="student">Student</option><option value="lecturer">Lecturer</option><option value="administrator">Administrator</option></select></Field>{fields.requestedRole !== 'student' && <p className="role-notice"><ShieldCheck size={16} />Lecturer and administrator permissions require administrator approval. Your learning account starts with student access.</p>}<p className="field-hint">You can add an optional profile picture during your personal setup.</p></>}<Button type="submit" className="w-full" size="lg" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" /> : <>{step === 1 ? 'Continue' : 'Create my account'}<ArrowRight /></>}</Button>{step === 2 && <Button variant="ghost" type="button" onClick={() => setStep(1)} disabled={busy}><ArrowLeft />Back to account details</Button>}</form><p className="auth-switch">Already have an account? <a href="/login">Sign in</a></p><p className="signup-assurance"><ShieldCheck size={13} />Your progress stays connected to your account.</p></AuthLayout>
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const { requestPasswordRecovery } = await import('@netlify/identity')
      await requestPasswordRecovery(email.trim())
      setSent(true)
    } catch (problem) {
      const { AuthError } = await import('@netlify/identity')
      if (problem instanceof AuthError && problem.status === 404) setSent(true)
      else setError('We could not send a reset link right now. Please try again shortly.')
    } finally { setBusy(false) }
  }
  return <AuthLayout><div className="auth-heading-icon"><Mail size={24} /></div><span className="form-eyebrow">LET’S GET YOU BACK ON TRACK</span><h1>{sent ? 'Check your inbox.' : 'Forgot your password?'}</h1><p className="auth-intro">{sent ? 'If an account exists for this email, you’ll receive a secure password reset link. Check your spam folder too.' : 'It happens. Enter your email and we’ll send you a link to choose a new one.'}</p><FormError message={error} />{sent ? <><div className="email-steps"><p><span>1</span>Open the password reset email.</p><p><span>2</span>Follow the secure link.</p><p><span>3</span>Choose a new, strong password.</p></div><Button variant="outline" className="w-full" onClick={() => setSent(false)}>Try a different email</Button></> : <form onSubmit={submit} className="auth-form"><Field label="Email address"><Input type="email" autoComplete="email" placeholder="you@university.edu" required value={email} onChange={event => setEmail(event.target.value)} /></Field><Button className="w-full" size="lg" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" /> : <>Send reset link<ArrowRight /></>}</Button></form>}<a className="auth-return" href="/login"><ArrowLeft size={15} />Back to sign in</a></AuthLayout>
}

export function ResetPasswordPage() {
  const { user, recovery, ready, error: callbackError } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    if (!validPassword(password)) { setError('Use at least 8 characters, including uppercase, lowercase, and a number.'); return }
    if (password !== confirm) { setError('Your passwords do not match.'); return }
    setBusy(true)
    try {
      const { updateUser, logout } = await import('@netlify/identity')
      await updateUser({ password })
      sessionStorage.removeItem('anatomy_recovery')
      await logout()
      window.location.assign('/login?reset=success')
    } catch { setError('Your password could not be updated. Your link may have expired. Please request a new one.'); setBusy(false) }
  }
  return <AuthLayout><div className="auth-heading-icon"><LockKeyhole size={24} /></div><span className="form-eyebrow">A FRESH START</span><h1>Choose a new password.</h1><p className="auth-intro">Make it memorable for you, and hard to guess for anyone else.</p><FormError message={error || callbackError} />{!ready ? <div className="inline-loading"><LoaderCircle className="animate-spin" />Checking your secure link…</div> : user && recovery ? <form onSubmit={submit} className="auth-form"><PasswordInput value={password} onChange={setPassword} strength label="New password" /><PasswordInput value={confirm} onChange={setConfirm} confirm label="Confirm new password" /><p className="field-hint">At least 8 characters, with uppercase, lowercase, and a number.</p><Button className="w-full" size="lg" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" /> : <>Update password<ArrowRight /></>}</Button></form> : <div className="reset-link-required"><p>Open the secure link in your password reset email to continue. If it has expired, you can request a new one.</p><Button asChild className="w-full"><a href="/forgot-password">Request a new reset link<ArrowRight /></a></Button></div>}<a className="auth-return" href="/login"><ArrowLeft size={15} />Back to sign in</a></AuthLayout>
}

export function VerifyEmailPage() {
  const { user, error } = useAuth()
  return <AuthLayout><div className="auth-heading-icon"><Mail size={24} /></div><span className="form-eyebrow">YOU’RE ALMOST THERE</span><h1>One little check.</h1><p className="auth-intro">We’ve sent a verification link to your email. Confirm your address to unlock your personal learning workspace.</p><FormError message={error} /><div className="email-steps"><p><span>1</span>Find the verification email in your inbox.</p><p><span>2</span>Click the secure verification link.</p><p><span>3</span>Set up a study journey that’s yours.</p></div><div className="verification-note"><ShieldCheck size={20} /><p>Verification keeps your account secure and makes sure your progress belongs to you.</p></div><Button asChild className="w-full" size="lg"><a href={user ? '/onboarding' : '/login'}>{user ? 'Continue to my setup' : 'I’ve verified — sign in'}<ArrowRight /></a></Button><p className="auth-switch">Wrong email address? <a href="/signup">Start again</a></p><p className="field-hint text-center">Can’t find it? Check your spam or promotions folder.</p></AuthLayout>
}
