# Project guide

## Product

Abdulsobbur Anatomy is a personalized anatomy learning platform. This repository was scaffolded as a new project; it does not contain migrated source or historical data from the original anatomy website. The owner explicitly approved Netlify Identity and Netlify Database in place of Supabase.

## Architecture

- React 19 and TypeScript run in TanStack Start, with file-based TanStack Router routes and a Vite build.
- Tailwind CSS 4 supplies utility classes. Repository-local shadcn/ui primitives use Radix, class-variance-authority, and `cn`.
- `@netlify/identity` provides headless authentication, email callbacks, token refresh, and session events. Never use the legacy Identity widget or import GoTrue directly.
- Modern Netlify Functions expose private `/api/*` endpoints. They read the server session and enforce origin checks on writes.
- Netlify Database stores all structured account state through `drizzle-orm/netlify-db`. Netlify Blobs stores only binary profile pictures.
- Netlify AI Gateway supplies server-side Gemini inference. Never expose provider credentials in client code, output, documentation, or logs.

## Directories

- `src/routes/` — thin route entry points; `__root.tsx` wraps all pages in the authentication provider and defines share metadata.
- `src/components/` — dashboard, workspace shell, authentication flows, onboarding, learning views, and account management. Feature filenames use kebab-case; component exports use PascalCase.
- `src/components/ui/` — reusable shadcn/ui-style primitives. `components.json` configures aliases and component generation.
- `src/lib/` — the auth context, typed API helper, shared data types, starter educational content, and explicitly labeled demo fixtures.
- `src/styles.css` — base theme and dashboard styles; `src/styles/auth.css` and `src/styles/learning.css` are imported here. `src/styles/responsive.css` is imported after the base stylesheet from the root route.
- `db/` — server-only Drizzle client factory and complete schema.
- `netlify/functions/` — deployable `.mts` API handlers. Helpers belong in `netlify/lib/`, not in the deployable function directory.
- `netlify/database/migrations/` — generated, named schema migrations; Netlify applies them at deploy time.
- `public/img/` — the generated anatomy illustration. Use Netlify Image CDN URLs when rendering it.
- `.netlify/features/netlify-identity` — activation marker for Identity.

## Data model

The profile primary key is the Netlify Identity user ID. Study attempts, topic progress, achievements, tutor messages, and daily AI usage reference it with cascading deletion. Roles are intentionally **not** editable database profile permissions: effective access comes from server-controlled Identity metadata. `requestedRole` only records a signup preference.

MCQ/spotter submissions are graded on the server and have a retry-safe UUID. Attempts, topic progress, and achievements are recorded transactionally. Analytics derive from persisted attempts. Viva feedback has no numerical grade. Reading and AI study sessions contribute to streaks but not question accuracy. All daily analytics and quotas use UTC.

The AI usage quota uses an atomic Postgres upsert to cap an account at 30 requests per UTC day. API failures can consume quota. Tutor history is loaded from the database, not browser storage. Avatar objects are private and their read endpoint always determines ownership from the signed-in user.

## Authentication decisions

The homepage shows a clearly labeled illustrative workspace to guests. Signed-in users see real data, never demo progress. `/dashboard` and all learning/account routes are gated by `Protected`; backend endpoints independently authenticate every request. Profile completion is required before learning pages.

The auth provider processes verification, recovery, and OAuth hashes on all pages. A non-secret session-storage marker identifies a completed recovery callback; no callback token is stored by application code. The Identity SDK owns its own auth storage. Do not store profile data, progress, preferences, or learning history in localStorage or local files.

“Remember me” uses a non-secret preference cookie and renews the SDK session-cookie lifetimes. Unchecked login leaves browser-session cookies. Theme preferences for authenticated, onboarded users persist in their database profile; guest theme changes are temporary.

Google OAuth requires external-provider configuration in the Netlify Identity dashboard. The UI checks whether it is enabled. First-administrator bootstrap must happen through the trusted Netlify Identity dashboard/admin API, setting `app_metadata.roles` to include `administrator`. Self-registration must never grant administrator or lecturer permissions.

## Conventions

- Keep routes thin and feature code in reusable components.
- Use the `@/` alias for frontend imports and relative paths in server modules.
- Keep TypeScript strict, with type-only imports when appropriate; avoid unused declarations and one-letter variable names.
- Validate untrusted structured input with Zod. Never trust client-provided user IDs or scores.
- Read relevant Netlify skills before changing authentication, storage, functions, or AI models.
- Keep both Drizzle packages on the same `@beta` release line because this project uses the Netlify Database adapter.
- Every schema change requires a generated migration using a descriptive imperative name, e.g. `pnpm exec drizzle-kit generate --name add_learning_feature`.
- Use Netlify platform primitives for persistence; do not add an external database or misuse Blobs for relational records.
- Preserve the warm-violet clinical visual identity, light/dark support, visible keyboard focus, labels, status/error announcements, and reduced-motion behavior.
- Place global resets inside CSS layers if adding them. Unlayered `button`, `a`, or `font` resets can override Tailwind utility styling and break shadcn primitives.
- Educational AI is not a medical advice feature. Maintain the disclaimer and verify new clinical teaching content against appropriate references.

## Local development & checks

Use Node.js 22.12+ and pnpm. `pnpm dev` starts Netlify Dev on port 8889; `pnpm dev:vite` starts the UI-only Vite server on port 3000. Netlify Functions, Identity, Database, and AI behavior should be verified on a configured deploy preview.

During automated Build mode sessions, **do not run local build, test, typecheck, or development-server commands**. The platform validates builds automatically. Schema migration generation and feature-activation scripts are permitted. Review source files instead. Never create commits or inspect the `.git` directory.

After substantial changes, update `README.md` and write a standalone, past-tense summary to `.netlify/results.md`. Keep secrets and environment-variable values out of all output and files.
