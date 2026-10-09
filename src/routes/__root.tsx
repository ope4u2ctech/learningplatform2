import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import '../styles.css'
import '../styles/responsive.css'
import { AuthProvider } from '@/lib/auth-context'

const siteName = 'Abdulsobbur Anatomy — Your anatomy learning companion'
const siteDescription = 'Build a stronger foundation in anatomy with personalized practice, spotters, viva preparation, and an AI study companion.'

export const Route = createRootRoute({
  notFoundComponent: () => <div className="full-state"><h1>Let’s get you back on track.</h1><p>This page isn’t part of your anatomy workspace.</p><a href="/">Return to your workspace</a></div>,
  errorComponent: ({ reset }) => <div className="full-state"><h1>A little interruption.</h1><p>This page could not be loaded. Your saved progress is still connected to your account.</p><button onClick={reset} className="rounded-lg bg-primary px-5 py-3 text-white">Try again</button><a href="/">Return to your workspace</a></div>,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: siteName,
      },
      {
        name: 'description',
        content: siteDescription,
      },
      {
        property: 'og:title',
        content: siteName,
      },
      {
        property: 'og:description',
        content: siteDescription,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700&family=Manrope:wght@400;500;600;650;700;750;800&display=swap' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Scripts />
      </body>
    </html>
  )
}
