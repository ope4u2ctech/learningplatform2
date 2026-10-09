# Abdulsobbur Anatomy

A personal anatomy learning workspace with secure accounts, guided academic onboarding, MCQ practice, a skeletal spotter, study notes, viva practice, and an AI study companion.

The project uses **React 19, TypeScript, TanStack Start, Tailwind CSS 4, and local shadcn/ui primitives**. Authentication uses **Netlify Identity**, structured account data uses **Netlify Database with Drizzle ORM**, and profile pictures use **Netlify Blobs**. AI feedback is provided through **Netlify AI Gateway** and the Google GenAI SDK. This Netlify-native stack was selected with the project owner’s approval instead of Supabase.

## Getting started

Use Node.js 22.12 or newer and pnpm. Install the Netlify CLI separately if it is not already available, and link the project to its Netlify site.

```sh
pnpm install
pnpm dev
```

The development command starts Netlify’s local environment on port **8889**, including the app and serverless functions. `pnpm dev:vite` starts only the interface on port 3000. Full authentication, mail delivery, database provisioning, and AI Gateway behavior should be checked on a Netlify deploy preview; a plain Vite server does not provide these services.

Netlify provides runtime service configuration. No credentials need to be included in source files or passed to the browser. The database adapter automatically connects to the site’s database. The AI SDK reads the Gateway-injected `GEMINI_API_KEY` and `GOOGLE_GEMINI_BASE_URL` environment variables on the server.

## Authentication setup

The Identity activation marker is included in `.netlify/features/netlify-identity`. Registration is open, and email verification remains enabled. Identity verification and recovery links are handled on every page, including links that return to the homepage.

For **Google login**, enable Google under the site’s **Identity external providers** and configure the provider’s OAuth settings in Netlify. The Google button checks availability and gives a clear email-login fallback when the provider is disabled. Provider credentials must never be placed in client-side code.

Bootstrap the first administrator using the Netlify Identity dashboard or a trusted server-side admin operation, assigning `administrator` in the account’s **server-managed `app_metadata.roles`**. Do not put permissions in user-editable metadata. After signing in, administrators can review accounts and assign Student, Lecturer, or Administrator access from `/admin`. Selecting an elevated role during registration records a request only; it never grants privileges. The management page shows up to 100 accounts and prevents self-demotion.

Email/password sessions are handled by `@netlify/identity`, including token refresh and cross-tab changes. With “Remember me” enabled, the SDK’s authentication cookies are renewed with a 30-day browser lifetime; otherwise they remain browser-session cookies. Actual access still depends on the Identity token’s validity and revocation state. Sign-out clears the current SDK session and its cookies. Verification precedes onboarding, and users must complete onboarding before opening protected learning pages.

## Pages

- `/` — clearly labeled guest workspace preview, or the signed-in user’s live dashboard.
- `/signup`, `/login` — registration and sign-in, with academic details and password controls.
- `/forgot-password`, `/reset-password`, `/verify-email` — recovery and verification.
- `/onboarding`, `/profile` — academic course, level, interests, preferred study mode, and optional picture upload.
- `/dashboard` — protected personalized dashboard with live account statistics.
- `/learn/mcqs`, `/learn/spotters`, `/learn/notes` — starter practice content and reading records.
- `/learn/viva`, `/learn/ai-tutor` — saved AI feedback and conversation history.
- `/progress`, `/achievements`, `/settings`, `/admin` — account-linked insights and management.

The initial content includes 13 foundation MCQs across five anatomy topics, one upper-limb spotter, five short concept notes, and five viva prompts. This is a functioning starting collection, not a replacement for a comprehensive curriculum. Existing content and historical accounts from the previously shared site were not migrated into this fresh project.

## Data & security

`db/schema.ts` defines profiles, study attempts, topic progress, achievements, tutor messages, and daily AI usage. All learning records reference the Identity account ID. Each API determines that ID from the verified server-side session, never from a browser-supplied account ID. Reads are private, writes enforce same-origin checks, and profile input is validated with Zod.

Practice scores are recalculated on the server against the known question bank. Practice submission IDs prevent retries from recording the same session twice. Related attempts, progress, and achievements are saved in transactions. Analytics are calculated from real account records rather than browser-reported statistics. Questions answered and accuracy include MCQs and spotters; reading, viva, and tutor sessions also contribute to the study streak. Dates and daily goals use UTC. Recommendations use the weakest recorded topic, or an onboarding interest before enough practice exists.

AI usage has an atomic database-backed limit of 30 requests per account per UTC day, shared between the tutor and viva. Failed provider requests also consume an allowance. Viva feedback is formative and deliberately does not fabricate numerical examination scores. AI output is displayed as text and is intended for educational use only, not diagnosis or treatment.

Profile pictures are private account-owned Blob objects. Uploads are limited to 2 MB and validated by file signatures. Only the authenticated owner can retrieve an uploaded picture. Light/dark appearance and question goals are saved to the authenticated profile. Guest theme changes are temporary. No learning data is stored in browser storage; the Identity SDK manages its own session storage.

## Database changes

Schema migrations are committed under `netlify/database/migrations` and applied by Netlify during deployment. After changing the schema, generate a descriptively named migration:

```sh
pnpm exec drizzle-kit generate --name add_descriptive_change
```

Keep the `@beta` versions of Drizzle ORM and Drizzle Kit together: the Netlify Database adapter in this project uses that release line. Never include database connection secrets in the repository.

## Design & accessibility

The interface includes mobile navigation, light/dark themes, keyboard-visible focus states, labeled fields, password visibility controls, status/error announcements, Radix-based focus-managed dialogs, and reduced-motion support. The generated skeleton artwork is served through Netlify Image CDN. `components.json` configures the local shadcn/ui component directory.

## Deployment verification

The platform runs the production build automatically. After deployment, verify registration and email links, password recovery, session restoration, role checks, private profile access, score persistence, picture upload, and configured Google OAuth. Confirm that database migrations applied and Gateway-backed tutor requests work. No local builds or development servers were started during implementation.
