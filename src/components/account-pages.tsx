import { useEffect, useState } from 'react'
import { ArrowRight, Award, Check, Flame, LockKeyhole, LoaderCircle, LogOut, ShieldCheck, Sparkles, Target, Trophy } from 'lucide-react'
import { AppShell } from './app-shell'
import { Button } from './ui/button'
import { FormError } from './auth-pages'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { modeLabels, topics, type DashboardData, type Role } from '@/lib/types'

function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true)
    api<DashboardData>('dashboard').then(result => { if (active) { setData(result); setError('') } }).catch(problem => { if (active) setError(problem.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [revision])
  return { data, loading, error, reload: () => setRevision(value => value + 1) }
}

export function ProgressPage() {
  const { data, loading, error, reload } = useDashboardData()
  return <AppShell active="progress" title="My progress"><div className="page-enter"><div className="section-page-heading"><span className="form-eyebrow">LOOK HOW FAR YOU’VE COME</span><h1>Your journey, in perspective.</h1><p>Find your strengths, focus on the gaps, and keep moving forward.</p></div>{error && <div className="error-banner" role="alert">{error}<button onClick={reload}>Retry</button></div>}{loading ? <div className="inline-loading"><LoaderCircle className="animate-spin" />Bringing your progress into focus…</div> : data && <><div className="stats-grid">{[{ label: 'Current study streak', value: `${data.streak} days`, icon: Flame, color: 'stat-orange' }, { label: 'Total questions answered', value: data.totalAnswered, icon: Check, color: 'stat-purple' }, { label: 'Practice accuracy', value: `${data.accuracy}%`, icon: Target, color: 'stat-green' }].map(item => <section className="stat-card" key={item.label}><div className="stat-card-top"><span>{item.label}</span><span className={`stat-icon ${item.color}`}><item.icon size={18} /></span></div><div className="stat-value">{item.value}</div></section>)}</div><div className="progress-page-grid"><section className="panel"><h2>Your anatomy foundations</h2>{topics.map(topic => { const progress = data.progress.find(item => item.topic === topic); const accuracy = progress?.total ? Math.round(progress.correct / progress.total * 100) : 0; return <div className="topic-progress-row" key={topic}><div><strong>{topic}</strong><span>{progress?.total ? `${accuracy}%` : 'Not practiced yet'}</span></div><div className="progress-track"><span style={{ width: `${accuracy}%` }} /></div><p>{progress ? `${progress.sessions} ${progress.sessions === 1 ? 'session' : 'sessions'} · ${progress.total} questions answered` : 'A new area waiting to be explored'}</p></div> })}</section><section className="panel"><h2>Your next focus</h2><div className="viva-question"><span className="viva-eyebrow"><Sparkles size={13} />RECOMMENDED TOPIC</span><h2>{data.recommendedTopic}</h2><p className="field-hint">{data.weakestTopic ? 'The topic with your lowest recorded accuracy. A little extra practice can turn it into a strength.' : 'Start with a topic from your interests. Recommendations become more focused as you practice.'}</p><Button asChild variant="secondary" className="mt-5 w-full"><a href={`/learn/mcqs?topic=${encodeURIComponent(data.recommendedTopic)}`}>Let’s work on it<ArrowRight /></a></Button></div><p className="field-hint mt-5">Accuracy includes MCQs and spotters only. Notes contribute to your study streak. Viva feedback is formative and has no numerical score.</p></section></div><section className="panel history-panel"><h2>Your recent study sessions</h2>{data.attempts.length ? <div className="history-list">{data.attempts.map(attempt => <div key={attempt.id}><div><strong>{attempt.topic}</strong><p>{modeLabels[attempt.mode]}</p>{attempt.mode === 'viva' && attempt.feedback && <details className="viva-history-detail"><summary>Review feedback</summary><div className="ai-response">{attempt.feedback}</div></details>}</div><span>{new Date(attempt.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</span><span>{attempt.total ? `${attempt.correct} / ${attempt.total} correct` : attempt.mode === 'notes' ? 'Reading logged' : attempt.mode === 'ai-tutor' ? 'Conversation saved' : 'Feedback saved'}</span></div>)}</div> : <div className="history-empty">Your first study session is the start of the story. <a href="/learn/mcqs" className="text-primary">Start practicing.</a></div>}</section></>}</div></AppShell>
}

const achievementDefinitions = [
  { code: 'first-session', name: 'First steps', description: 'Complete your first anatomy study session. A small start is still a start.', icon: Award },
  { code: 'perfect-session', name: 'Sharp mind', description: 'Answer every question in a session of at least 3 questions correctly.', icon: Sparkles },
  { code: 'fifty-correct', name: 'Building foundations', description: 'Answer 50 anatomy questions correctly across your practice sessions.', icon: Trophy },
]

export function AchievementsPage() {
  const { data, loading, error, reload } = useDashboardData()
  return <AppShell active="achievements" title="Achievements"><div className="page-enter"><div className="section-page-heading"><span className="form-eyebrow">EVERY SMALL WIN COUNTS</span><h1>Milestones worth celebrating.</h1><p>Not a race. A reminder of the effort you put into understanding.</p></div>{error && <div className="error-banner" role="alert">{error}<button onClick={reload}>Retry</button></div>}{loading ? <div className="inline-loading"><LoaderCircle className="animate-spin" />Gathering your milestones…</div> : <div className="achievement-grid">{achievementDefinitions.map(achievement => { const earned = data?.achievements.find(item => item.code === achievement.code); return <section className={`achievement-card ${earned ? '' : 'locked'}`} key={achievement.code}><span className="achievement-symbol"><achievement.icon size={30} strokeWidth={1.6} /></span><h2>{achievement.name}</h2><p>{achievement.description}</p><span className="achievement-state">{earned ? <><Check size={13} />Earned {new Date(earned.earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}</> : <><LockKeyhole size={12} />Your next milestone</>}</span></section> })}</div>}<div className="milestone-strip"><span className="milestone-icon"><Target size={23} /></span><div><strong>Your progress is more than a badge.</strong><p>Keep showing up, asking questions, and making connections.</p></div><a href="/learn/mcqs">Start a study session<ArrowRight size={14} /></a></div></div></AppShell>
}

export function SettingsPage() {
  const { profile, saveProfile, dark, toggleTheme, signOut } = useAuth()
  const [goal, setGoal] = useState(profile?.dailyGoal ?? 20)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  async function saveGoal() {
    setBusy(true); setError(''); setSuccess('')
    try { await saveProfile({ dailyGoal: goal }); setSuccess('Your daily goal is saved. Keep learning at your pace.') }
    catch (problem) { setError(problem instanceof Error ? problem.message : 'Your goal could not be saved.') }
    finally { setBusy(false) }
  }
  return <AppShell active="settings" title="Settings"><div className="page-enter"><div className="section-page-heading"><span className="form-eyebrow">A WORKSPACE THAT FEELS LIKE YOU</span><h1>Your account, your way.</h1><p>Keep your profile current and make your study space comfortable.</p></div><FormError message={error} />{success && <div role="status" className="form-success"><Check size={15} />{success}</div>}<section className="panel settings-panel"><h2>Personal & academic details</h2><div className="settings-row"><div><strong>{profile?.fullName}</strong><p>{profile?.email}</p></div><Button variant="outline" asChild><a href="/profile">Edit profile</a></Button></div><div className="settings-row"><div><strong>{profile?.university}</strong><p>{profile?.faculty} · {profile?.department}<br />{profile?.course} · {profile?.level}</p></div><span className="student-badge">{profile?.role}</span></div>{profile && profile.requestedRole !== 'student' && profile.requestedRole !== profile.role && <div className="role-notice"><ShieldCheck size={16} />Your requested {profile.requestedRole} access requires administrator approval. Until then, you have student access.</div>}</section><section className="panel settings-panel"><h2>Your learning preferences</h2><div className="settings-row"><div><strong>Daily practice goal</strong><p>A manageable target is easier to make a habit.</p></div><select aria-label="Daily question goal" className="form-select" value={goal} onChange={event => setGoal(Number(event.target.value))}>{[5, 10, 15, 20, 30, 40, 50, 75, 100].map(value => <option key={value} value={value}>{value} questions</option>)}</select></div><Button disabled={busy || goal === profile?.dailyGoal} onClick={() => void saveGoal()}>{busy ? <LoaderCircle className="animate-spin" /> : <Check />}Save daily goal</Button><div className="settings-row mt-5"><div><strong>Appearance</strong><p>{dark ? 'A calmer space for late-night studying.' : 'A clear, light space to focus.'}</p></div><Button variant="outline" onClick={toggleTheme}>{dark ? 'Use light mode' : 'Use dark mode'}</Button></div></section><section className="panel settings-panel"><h2>Account security</h2><div className="settings-row"><div><strong>Password</strong><p>Send a secure password reset link to your email.</p></div><Button variant="outline" asChild><a href="/forgot-password">Reset password</a></Button></div><div className="settings-row"><div><strong>Sign out securely</strong><p>End this session and protect your account on shared devices.</p></div><Button variant="outline" onClick={() => void signOut().catch(() => setError('Your session could not be ended. Please try again.'))}><LogOut />Sign out</Button></div></section></div></AppShell>
}

interface ManagedUser { id: string; name?: string; email?: string; role: Role; requestedRole: Role }

export function AdminPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [roles, setRoles] = useState<Record<string, Role>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  useEffect(() => { api<ManagedUser[]>('admin').then(setUsers).catch(problem => setError(problem.message)).finally(() => setLoading(false)) }, [])
  async function saveRole(account: ManagedUser) {
    setBusy(account.id); setError(''); setSuccess('')
    try { await api('admin', { method: 'PUT', body: JSON.stringify({ userId: account.id, role: roles[account.id] ?? account.role }) }); setUsers(previous => previous.map(item => item.id === account.id ? { ...item, role: roles[account.id] ?? item.role } : item)); setSuccess('The account’s role is updated. The new permissions apply after the next sign-in or token refresh.') }
    catch (problem) { setError(problem instanceof Error ? problem.message : 'The role could not be updated.') }
    finally { setBusy('') }
  }
  return <AppShell active="admin" title="Administration"><div className="page-enter"><div className="section-page-heading"><span className="form-eyebrow">TRUSTED ACCESS</span><h1>A secure learning community.</h1><p>Review role requests and manage account permissions. Elevated access is never self-assigned.</p></div><FormError message={error} />{success && <div className="form-success" role="status"><Check size={15} />{success}</div>}{loading ? <div className="inline-loading"><LoaderCircle className="animate-spin" />Loading accounts…</div> : <section className="panel admin-list"><table><thead><tr><th scope="col">Account</th><th scope="col">Requested role</th><th scope="col">Access role</th><th scope="col">Action</th></tr></thead><tbody>{users.map(account => <tr key={account.id}><td><strong>{account.name ?? 'Learner'}</strong><p>{account.email}</p></td><td>{account.requestedRole}</td><td><select aria-label={`Role for ${account.name ?? account.email}`} className="form-select" value={roles[account.id] ?? account.role} disabled={account.id === user?.id || !!busy} onChange={event => setRoles(previous => ({ ...previous, [account.id]: event.target.value as Role }))}><option value="student">Student</option><option value="lecturer">Lecturer</option><option value="administrator">Administrator</option></select></td><td><Button size="sm" disabled={account.id === user?.id || !roles[account.id] || roles[account.id] === account.role || !!busy} onClick={() => void saveRole(account)}>{busy === account.id ? <LoaderCircle className="animate-spin" /> : 'Update'}</Button></td></tr>)}</tbody></table><p className="field-hint mt-4">Showing up to 100 accounts. Your own administrator role is protected from changes here.</p></section>}</div></AppShell>
}
