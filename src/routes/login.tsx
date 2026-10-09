import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '@/components/auth-pages'

export const Route = createFileRoute('/login')({ component: LoginPage })
