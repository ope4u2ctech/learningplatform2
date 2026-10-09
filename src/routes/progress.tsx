import { createFileRoute } from '@tanstack/react-router'
import { ProgressPage } from '@/components/account-pages'
import { Protected } from '@/components/protected'

export const Route = createFileRoute('/progress')({ component: () => <Protected><ProgressPage /></Protected> })
