import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Brain, Check, Clock3, LoaderCircle, LockKeyhole, Mic, Search, Send, Sparkles, Trophy } from 'lucide-react'
import { AppShell } from './app-shell'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Field, FormError } from './auth-pages'
import { SkeletonSpotter } from './anatomy-art'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { modeLabels, topics, type ChatMessage, type StudyMode } from '@/lib/types'
import { notes, questions, spotterQuestion, vivaPrompts, type Question } from '@/lib/learning-content'

const modeTitles: Record<StudyMode, { title: string; subtitle: string }> = {
  mcqs: { title: 'A question at a time.', subtitle: 'Build confidence, find the gaps, and make what you learn stick.' },
  spotters: { title: 'Train your anatomy eye.', subtitle: 'Look closer. Identify the structure. Connect it to what you know.' },
  viva: { title: 'Find your voice.', subtitle: 'Practice explaining anatomy clearly, with supportive AI feedback.' },
  notes: { title: 'Build your foundation.', subtitle: 'A focused starting point for the concepts that connect it all.' },
  'ai-tutor': { title: 'Curiosity, meet clarity.', subtitle: 'Your personal anatomy study companion. No question is too small.' },
}

export function LearningPage({ mode }: { mode: StudyMode }) {
  const [topic, setTopic] = useState<string>('All topics')
  const [search, setSearch] = useState('')
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const chosenTopic = params.get('topic')
    if (chosenTopic && topics.includes(chosenTopic as typeof topics[number])) { setTopic(chosenTopic); if (mode === 'mcqs' || mode === 'notes') setActiveTopic(chosenTopic) }
    setSearch(params.get('q') ?? '')
  }, [mode])
  const visibleTopics = topics.filter(item => (topic === 'All topics' || item === topic) && `${item} ${notes[item].title} ${notes[item].intro}`.toLowerCase().includes(search.toLowerCase()))
  const heading = modeTitles[mode]
  return <AppShell active={mode} title={modeLabels[mode]}><div className="page-enter learning-page"><div className="learning-heading"><span className="form-eyebrow">LEARN WITH PURPOSE</span><h1>{heading.title}</h1><p>{heading.subtitle}</p></div>{mode === 'ai-tutor' ? <TutorChat /> : mode === 'spotters' ? <Quiz topic="Osteology" mode="spotters" onBack={() => { window.location.assign('/dashboard') }} /> : mode === 'viva' ? <><TopicFilter value={topic} onChange={setTopic} all={false} /><VivaPractice topic={topic === 'All topics' ? 'Gross Anatomy' : topic} /></> : activeTopic ? mode === 'notes' ? <StudyNote topic={activeTopic} onBack={() => setActiveTopic(null)} /> : <Quiz topic={activeTopic} mode="mcqs" onBack={() => setActiveTopic(null)} /> : <><TopicFilter value={topic} onChange={setTopic} /><div className="library-search"><Input aria-label="Search study topics" placeholder="Search your anatomy topics…" value={search} onChange={event => setSearch(event.target.value)} /><Search size={17} /></div><div className="library-grid">{visibleTopics.map(item => <section className="library-card" key={item}><span className="library-icon">{item === 'Neuroanatomy' ? <Brain size={24} /> : <BookOpen size={24} />}</span><h2>{item}</h2><p>{notes[item].intro}</p><div className="library-meta"><span><BookOpen size={12} />{mode === 'mcqs' ? `${questions.filter(question => question.topic === item).length} questions` : 'Core concepts'}</span><span><Clock3 size={12} />5 min</span></div><Button variant="secondary" onClick={() => setActiveTopic(item)}>{mode === 'mcqs' ? 'Start practice' : 'Open study notes'}<ArrowRight size={14} /></Button></section>)}</div>{!visibleTopics.length && <div className="panel history-empty">No topics match your search. Try a broader term or choose another area of interest.</div>}<p className="medical-disclaimer mt-6"><LockKeyhole size={15} />Your study sessions are saved securely to your account. Educational content supports, but doesn’t replace, your approved anatomy textbooks.</p></>}</div></AppShell>
}

function TopicFilter({ value, onChange, all = true }: { value: string; onChange: (topic: string) => void; all?: boolean }) {
  return <div className="topic-filter" aria-label="Filter by anatomy topic">{[...(all ? ['All topics'] : []), ...topics].map(topic => <button key={topic} className={value === topic || (!all && value === 'All topics' && topic === 'Gross Anatomy') ? 'selected' : ''} onClick={() => onChange(topic)} aria-pressed={value === topic}>{topic}</button>)}</div>
}

function Quiz({ topic, mode, onBack }: { topic: string; mode: 'mcqs' | 'spotters'; onBack: () => void }) {
  const bank: Question[] = mode === 'spotters' ? [spotterQuestion] : questions.filter(question => question.topic === topic)
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [answers, setAnswers] = useState<{ questionId: string; choice: number }[]>([])
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const requestId = useRef('')
  const question = bank[index]
  const score = answers.filter(answer => bank.find(item => item.id === answer.questionId)?.answer === answer.choice).length

  async function persist(responses: typeof answers) {
    setSaving(true); setError('')
    if (!requestId.current) requestId.current = crypto.randomUUID()
    try {
      await api('attempts', { method: 'POST', body: JSON.stringify({ requestId: requestId.current, mode, topic, answers: responses }) })
      setSaved(true)
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Your session could not be saved. Please retry.') }
    finally { setSaving(false) }
  }

  function next() {
    if (choice === null) return
    const responses = [...answers, { questionId: question.id, choice }]
    setAnswers(responses)
    if (index === bank.length - 1) { setFinished(true); void persist(responses) }
    else { setIndex(index + 1); setChoice(null); setChecked(false) }
  }

  if (finished) return <section className="quiz-panel"><div className="quiz-results"><div className="results-icon"><Trophy size={28} /></div><h2>Another step forward.</h2><div className="result-score">{score}<span> / {bank.length}</span></div><p>{score === bank.length ? 'A strong session. Keep making those connections.' : 'Every explanation is another chance to understand. Revisit the concepts that felt tricky.'}</p><p className="mt-3" role="status">{saving ? 'Saving your progress…' : saved ? 'Your results are saved to your account.' : 'Your results have not been saved yet.'}</p><FormError message={error} />{error && <Button onClick={() => void persist(answers)} disabled={saving} className="mt-4">Retry saving</Button>}<div className="result-actions"><Button variant="outline" onClick={onBack}>Back to topics</Button><Button asChild><a href="/progress">See my progress<ArrowRight /></a></Button></div></div></section>
  return <section className="quiz-panel"><div className="quiz-top"><button onClick={onBack}><ArrowLeft size={14} />{mode === 'spotters' ? 'Back to dashboard' : 'Back to topics'}</button><span>{topic} · {index + 1} of {bank.length}</span></div><div className="progress-track quiz-progress"><span style={{ width: `${index / bank.length * 100}%` }} /></div>{mode === 'spotters' && <><span className="form-eyebrow">SPOTTER 01 · UPPER LIMB</span><SkeletonSpotter /></>}<h2>{question.question}</h2><div className="quiz-options" role="group" aria-label="Answer choices">{question.options.map((option, optionIndex) => <button key={option} className={`quiz-option ${choice === optionIndex ? 'selected' : ''} ${checked && optionIndex === question.answer ? 'correct' : ''} ${checked && choice === optionIndex && optionIndex !== question.answer ? 'incorrect' : ''}`} disabled={checked} aria-pressed={choice === optionIndex} onClick={() => setChoice(optionIndex)}><span>{['A', 'B', 'C', 'D'][optionIndex]}</span>{option}{checked && optionIndex === question.answer && <Check size={17} className="ml-auto" />}</button>)}</div>{checked && <div className="answer-explanation" role="status"><strong>{choice === question.answer ? 'That’s right. Here’s why.' : 'Not quite. Let’s make the connection.'}</strong>{question.explanation}</div>}<div className="quiz-bottom"><span>Take your time. Understanding comes first.</span><Button onClick={checked ? next : () => setChecked(true)} disabled={choice === null}>{checked ? index === bank.length - 1 ? 'Finish session' : 'Next question' : 'Check answer'}<ArrowRight /></Button></div></section>
}

function StudyNote({ topic, onBack }: { topic: string; onBack: () => void }) {
  const note = notes[topic]
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const requestId = useRef('')
  async function markRead() {
    setBusy(true); setError('')
    if (!requestId.current) requestId.current = crypto.randomUUID()
    try { await api('attempts', { method: 'POST', body: JSON.stringify({ requestId: requestId.current, mode: 'notes', topic, answers: [] }) }); setSaved(true) }
    catch (problem) { setError(problem instanceof Error ? problem.message : 'Please try again.') }
    finally { setBusy(false) }
  }
  return <article className="study-note"><button className="auth-back" onClick={onBack}><ArrowLeft size={15} />Back to study notes</button><span className="form-eyebrow mt-8">{topic.toUpperCase()} · CORE CONCEPTS</span><h2>{note.title}</h2><p>{note.intro}</p><ol>{note.points.map(point => <li key={point}>{point}</li>)}</ol><div className="note-source">Use these notes as a starting point, then study your university’s approved texts in depth. For an open educational reference, explore <a href="https://openstax.org/details/books/anatomy-and-physiology-2e" target="_blank" rel="noreferrer">OpenStax Anatomy and Physiology</a>.</div><FormError message={error} /><div className="result-actions"><Button onClick={() => void markRead()} disabled={busy || saved}>{busy ? <LoaderCircle className="animate-spin" /> : saved ? <><Check />Reading logged</> : <><Check />Mark as studied</>}</Button><Button variant="outline" asChild><a href={`/learn/mcqs?topic=${encodeURIComponent(topic)}`}>Put it into practice<ArrowRight /></a></Button></div></article>
}

function VivaPractice({ topic }: { topic: string }) {
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const requestId = useRef('')
  useEffect(() => { setAnswer(''); setFeedback(''); setError(''); requestId.current = '' }, [topic])
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    if (!requestId.current) requestId.current = crypto.randomUUID()
    try {
      const response = await api<{ feedback: string }>('tutor', { method: 'POST', body: JSON.stringify({ mode: 'viva', topic, answer, requestId: requestId.current }) })
      setFeedback(response.feedback)
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Feedback is unavailable right now. Please try again.') }
    finally { setBusy(false) }
  }
  return <div className="max-w-3xl mx-auto"><section className="viva-question"><span className="viva-eyebrow"><Mic size={13} />YOUR PRACTICE PROMPT · {topic.toUpperCase()}</span><h2>{vivaPrompts[topic]}</h2></section><form onSubmit={submit} className="viva-form"><Field label="Your answer" hint="Think it through aloud, then write your explanation. At least 20 characters."><textarea className="form-textarea" placeholder="Start with the key structures, then explain the connections…" value={answer} onChange={event => { setAnswer(event.target.value); requestId.current = '' }} required minLength={20} maxLength={4000} disabled={busy} /></Field><FormError message={error} /><Button disabled={busy || !answer.trim()}>{busy ? <><LoaderCircle className="animate-spin" />Preparing your feedback…</> : <><Sparkles />Get supportive feedback</>}</Button></form>{feedback && <section className="panel feedback-panel" aria-live="polite"><h3>A clearer answer starts here.</h3><div className="ai-response">{feedback}</div><p className="field-hint">Your answer and feedback are saved in your viva history.</p></section>}<p className="medical-disclaimer mt-6">AI feedback is formative practice, not an examination grade. Confirm anatomical details with approved textbooks.</p></div>
}

function TutorChat() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const history = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let active = true
    api<ChatMessage[]>('tutor').then(result => { if (active) setMessages(result) }).catch(problem => { if (active) setError(problem.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  useEffect(() => { history.current?.scrollTo({ top: history.current.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) }, [messages, busy])
  async function send(event: FormEvent) {
    event.preventDefault()
    if (message.trim().length < 2 || busy) return
    setBusy(true); setError('')
    const text = message.trim()
    const id = crypto.randomUUID()
    setMessages(previous => [...previous, { id, role: 'user', content: text }])
    setMessage('')
    try {
      const response = await api<{ reply: string }>('tutor', { method: 'POST', body: JSON.stringify({ mode: 'chat', message: text }) })
      setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'assistant', content: response.reply }])
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Your tutor could not respond. Please try again.')
      setMessages(previous => previous.filter(item => item.id !== id))
      setMessage(text)
    } finally { setBusy(false) }
  }
  return <section className="chat-panel"><div ref={history} className="chat-history" role="log" aria-label="Your anatomy tutor conversation" aria-live="polite">{loading ? <div className="inline-loading"><LoaderCircle className="animate-spin" />Finding your previous conversations…</div> : messages.length === 0 ? <div className="chat-empty"><span><Sparkles size={27} /></span><h2>Let’s connect the dots.</h2><p>Ask about a tricky concept, compare two structures, or work through what you’re learning.</p><div className="suggested-prompts">{['Explain the brachial plexus simply', 'Compare the three germ layers', 'Help me study cranial nerves'].map(prompt => <button key={prompt} onClick={() => setMessage(prompt)}>{prompt}</button>)}</div></div> : messages.map(item => <div className={`chat-message ${item.role}`} key={item.id}><span>{item.role === 'assistant' ? <Sparkles size={15} /> : profile?.fullName[0] ?? 'Y'}</span><div className="ai-response">{item.content}</div></div>)}{busy && <div className="chat-message assistant"><span><Sparkles size={15} /></span><div className="ai-response" role="status"><LoaderCircle size={15} className="inline mr-2 animate-spin" />Making the connections…</div></div>}</div>{error && <div className="px-5"><FormError message={error} /></div>}<form className="chat-input" onSubmit={send}><textarea value={message} onChange={event => setMessage(event.target.value)} aria-label="Message your anatomy tutor" placeholder="What would you like to understand?" rows={1} maxLength={2000} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (!loading) void send(event) } }} disabled={busy || loading} /><Button type="submit" size="icon" aria-label="Send message" disabled={busy || loading || message.trim().length < 2}><Send size={17} /></Button></form><p className="chat-disclaimer">A companion for your learning, not clinical advice. Check AI explanations against your approved textbooks. Your conversation is saved to your account.</p></section>
}
