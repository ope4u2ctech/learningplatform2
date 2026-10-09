import { createFileRoute } from '@tanstack/react-router'
import { OnboardingPage } from '@/components/onboarding'
import { Protected } from '@/components/protected'

export const Route = createFileRoute('/profile')({ component: () => <Protected><OnboardingPage editing /></Protected> })
