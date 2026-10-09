import { createFileRoute } from '@tanstack/react-router'
import { AchievementsPage } from '@/components/account-pages'
import { Protected } from '@/components/protected'

export const Route = createFileRoute('/achievements')({ component: () => <Protected><AchievementsPage /></Protected> })
