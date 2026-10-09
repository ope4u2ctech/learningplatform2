import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Check, GraduationCap, LoaderCircle, ScanLine, Sparkles, Upload, Mic, FileText, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { courses, levels, modeLabels, topics, type Profile, type StudyMode } from '@/lib/types'
import { Brand } from './brand'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Field, FormError } from './auth-pages'

const modes = [{ id: 'mcqs', icon: BookOpen, text: 'Test what you know' }, { id: 'spotters', icon: ScanLine, text: 'Learn by identifying' }, { id: 'viva', icon: Mic, text: 'Explain with confidence' }, { id: 'notes', icon: FileText, text: 'Read and connect the dots' }, { id: 'ai-tutor', icon: Sparkles, text: 'Ask, explore, understand' }] as const

export function OnboardingPage({ editing = false }: { editing?: boolean }) {
  const { profile, saveProfile, reloadProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [fields, setFields] = useState<Partial<Profile>>({})
  const [picture, setPicture] = useState<File | null>(null)
  const [picturePreview, setPicturePreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { if (profile) setFields(profile) }, [profile?.userId])
  useEffect(() => {
    if (!picture) { setPicturePreview(''); return }
    const url = URL.createObjectURL(picture)
    setPicturePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [picture])
  const change = (key: keyof Profile, value: unknown) => setFields(previous => ({ ...previous, [key]: value }))
  function toggleInterest(topic: string) { change('interests', fields.interests?.includes(topic) ? fields.interests.filter(item => item !== topic) : [...fields.interests ?? [], topic]) }
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    if (step === 2 && !fields.interests?.length) { setError('Choose at least one area that interests you.'); return }
    if (step < 3) { setStep(step + 1); return }
    setBusy(true)
    try {
      if (picture) {
        const body = new FormData(); body.append('picture', picture)
        await api('avatar', { method: 'POST', body })
      }
      await saveProfile(fields)
      await reloadProfile()
      window.location.assign('/dashboard')
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Your profile could not be saved. Please try again.'); setBusy(false) }
  }
  return <div className="onboarding-page"><header className="onboarding-topbar"><Brand /><span className="onboarding-security"><ShieldCheck size={15} />Your personal learning space</span></header><main className="onboarding-main page-enter"><div className="onboarding-progress">{['Your academic path', 'Your interests', 'Your study style'].map((label, index) => <div className={step >= index + 1 ? 'reached' : ''} key={label}><span>{step > index + 1 ? <Check size={13} /> : index + 1}</span><p>{label}</p></div>)}</div><div className="onboarding-card"><div className="onboarding-icon">{step === 1 ? <GraduationCap size={27} /> : step === 2 ? <Sparkles size={27} /> : <BookOpen size={27} />}</div><span className="form-eyebrow">{editing ? 'MAKE YOUR WORKSPACE MORE YOU' : 'LET’S MAKE THIS YOURS'} · STEP {step} OF 3</span><h1>{step === 1 ? 'Tell us about your journey.' : step === 2 ? 'Follow your curiosity.' : 'Learn your way.'}</h1><p className="onboarding-intro">{step === 1 ? 'A little context helps us make your learning more relevant.' : step === 2 ? 'Choose the areas you’d love to understand better. You can always change these later.' : 'There’s no single right way to study. What feels most like you?'}</p><FormError message={error} /><form onSubmit={submit}>{step === 1 ? <div className="onboarding-fields"><Field label="Full name"><Input value={fields.fullName ?? ''} onChange={event => change('fullName', event.target.value)} autoComplete="name" required minLength={2} maxLength={120} /></Field><fieldset className="form-field"><legend className="field-label">What course are you studying?</legend><div className="course-options">{courses.map(course => <label key={course} className={`selection-chip ${fields.course === course ? 'selected' : ''}`}><input type="radio" name="course" value={course} checked={fields.course === course} onChange={() => change('course', course)} required />{course}{fields.course === course && <Check size={13} />}</label>)}</div></fieldset><div className="form-two-columns"><Field label="University"><Input placeholder="Your university" value={fields.university ?? ''} onChange={event => change('university', event.target.value)} required minLength={2} maxLength={200} /></Field><Field label="Current academic level"><select className="form-select" value={fields.level ?? '100L'} onChange={event => change('level', event.target.value)}>{levels.map(level => <option key={level}>{level}</option>)}</select></Field><Field label="Faculty"><Input placeholder="Your faculty" value={fields.faculty ?? ''} onChange={event => change('faculty', event.target.value)} required minLength={2} maxLength={200} /></Field><Field label="Department"><Input placeholder="Your department" value={fields.department ?? ''} onChange={event => change('department', event.target.value)} required minLength={2} maxLength={200} /></Field></div></div> : step === 2 ? <div className="interest-options">{topics.map((topic, index) => <label className={`interest-option ${fields.interests?.includes(topic) ? 'selected' : ''}`} key={topic}><span className="interest-number">0{index + 1}</span><div><strong>{topic}</strong><span>{['The body, as a whole', 'Bones and the framework of life', 'A closer look at our tissues', 'Understanding how we begin', 'The connections that make us'][index]}</span></div><input type="checkbox" checked={fields.interests?.includes(topic) ?? false} onChange={() => toggleInterest(topic)} /></label>)}</div> : <><div className="preferred-modes">{modes.map(mode => <label className={`preferred-mode ${fields.preferredMode === mode.id ? 'selected' : ''}`} key={mode.id}><mode.icon size={22} /><strong>{modeLabels[mode.id]}</strong><span>{mode.text}</span><input type="radio" name="preferredMode" checked={fields.preferredMode === mode.id} onChange={() => change('preferredMode', mode.id as StudyMode)} required /></label>)}</div><div className="picture-upload"><div className="upload-avatar">{picturePreview || profile?.avatarKey ? <img src={picturePreview || `/api/avatar?v=${encodeURIComponent(profile?.avatarKey ?? '')}`} alt="Your profile picture preview" /> : (fields.fullName ?? 'You').split(' ').map(part => part[0]).slice(0, 2).join('')}</div><div><strong>A familiar face <span>Optional</span></strong><p>JPG, PNG, or WebP. Up to 2 MB.</p><label className="upload-label"><Upload size={13} />{picture ? 'Choose another picture' : 'Add your profile picture'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file && file.size > 2 * 1024 * 1024) { setError('Please choose a picture under 2 MB.'); event.target.value = ''; return }; setPicture(file ?? null); setError('') }} /></label></div></div></>}<div className="onboarding-actions">{step > 1 ? <Button type="button" variant="ghost" onClick={() => { setStep(step - 1); setError('') }} disabled={busy}><ArrowLeft />Back</Button> : <span className="onboarding-action-note"><LockIcon />Private to your account</span>}<Button type="submit" disabled={busy} size="lg">{busy ? <LoaderCircle className="animate-spin" /> : <>{step === 3 ? editing ? 'Save my profile' : 'Take me to my workspace' : 'Continue'}<ArrowRight /></>}</Button></div></form></div><p className="onboarding-bottom">Your goals may change. Your curiosity doesn’t have to.</p></main></div>
}

function LockIcon() { return <ShieldCheck size={13} /> }
