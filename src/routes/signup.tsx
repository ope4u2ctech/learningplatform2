import { createFileRoute } from '@tanstack/react-router'
import { SignupPage } from '@/components/auth-pages'

export const Route = createFileRoute('/signup')({ component: SignupPage })
