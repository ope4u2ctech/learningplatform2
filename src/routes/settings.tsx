import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/components/account-pages'
import { Protected } from '@/components/protected'

export const Route = createFileRoute('/settings')({ component: () => <Protected><SettingsPage /></Protected> })
