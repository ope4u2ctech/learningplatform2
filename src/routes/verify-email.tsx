import { createFileRoute } from '@tanstack/react-router'
import { VerifyEmailPage } from '@/components/auth-pages'

export const Route = createFileRoute('/verify-email')({ component: VerifyEmailPage })
