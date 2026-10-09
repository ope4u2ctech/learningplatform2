import { createFileRoute } from '@tanstack/react-router'
import { LearningPage } from '@/components/learning'
import { Protected } from '@/components/protected'
import type { StudyMode } from '@/lib/types'

export const Route = createFileRoute('/learn/$mode')({ component: LearningRoute })

function LearningRoute() {
  const { mode } = Route.useParams()
  if (!['mcqs', 'spotters', 'viva', 'notes', 'ai-tutor'].includes(mode)) return <div className="full-state"><h1>That study mode isn’t available.</h1><a href="/dashboard">Return to your workspace</a></div>
  return <Protected><LearningPage mode={mode as StudyMode} /></Protected>
}
