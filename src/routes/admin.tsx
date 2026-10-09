import { createFileRoute } from '@tanstack/react-router'
import { AdminPage } from '@/components/account-pages'
import { Protected } from '@/components/protected'

export const Route = createFileRoute('/admin')({ component: () => <Protected admin><AdminPage /></Protected> })
