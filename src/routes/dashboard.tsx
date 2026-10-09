import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/components/dashboard'
import { Protected } from '@/components/protected'

export const Route = createFileRoute('/dashboard')({ component: () => <Protected><Dashboard /></Protected> })
