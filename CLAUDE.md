# CLAUDE.md — Portfolio Project Guide

## Project Overview

Personal portfolio for **Denis**, a frontend-focused fullstack engineer. Single-page application with a protected admin panel for managing content via Supabase.

- **Live URL**: https://flaviodenis.vercel.app
- **Repo**: https://github.com/denisds73/my-portfolio
- **Framework**: React 19 + Vite 8 (SPA, client-side only)
- **Language**: TypeScript 6 (strict, `noUnusedLocals`, `noUnusedParameters`)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin, `@theme` directive for design tokens)
- **Backend**: Supabase (Postgres DB + Auth + auto-generated REST API)
- **Deployment**: Vercel with SPA rewrite (`vercel.json`)

## Commands

```bash
npm run dev      # Start dev server (Vite)
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint
npm run preview  # Preview production build locally
```

## Architecture

### Routing

React Router v7 — two route groups:

| Route | Purpose |
|---|---|
| `/` | Public portfolio (single page, smooth-scroll sections) |
| `/admin/login` | Supabase email/password auth |
| `/admin` | Protected admin dashboard (nested routes: projects, skills, experience) |

Entry: `src/App.tsx` → `BrowserRouter` with all routes. Public route includes `ScrollProgress`, `CustomCursor`, and `Navbar` as layout wrappers.

### Public Sections (render order in `src/pages/Home.tsx`)

1. **Hero** (`src/components/hero/Hero.tsx`) — full-viewport, left-aligned, ambient glow + noise texture, staggered Framer Motion fade-up, role subtitle, CTA buttons
2. **About** (`src/components/about/About.tsx`) — asymmetric two-column: italic pull quote left (offset down), prose right, IntersectionObserver reveal
3. **Work** (`src/components/work/WorkSection.tsx`) — projects from Supabase via `useProjects()`, 12-column CSS Grid, featured project gets wider image span, alternating image/text via `grid-column`
4. **Skills** (`src/components/skills/SkillsMarquee.tsx`) — skills from Supabase via `useSkills()`, static grid grouped by category (Languages, Frontend, Backend, Tools), tag-pill layout with hover accent
5. **Experience** (`src/components/experience/ExperienceList.tsx`) — from Supabase via `useExperience()`, three-column grid rows (company/role/dates), descriptions always visible
6. **Contact** (`src/components/contact/Contact.tsx`) — two-column: CTA + email + socials left, `react-hook-form` form right. Includes `<footer>` with copyright. Email sending is TODO (stub with setTimeout)

### Admin Panel (`src/pages/admin/`)

- `AdminLayout.tsx` — sidebar nav, auth guard via `useAuth()`, redirects to `/admin/login` if unauthenticated
- `Dashboard.tsx` — stat cards (project/skill/experience counts from Supabase)
- `ProjectsManager.tsx` — full CRUD with inline form, comma-separated tech_stack input
- `SkillsManager.tsx` — CRUD with drag-and-drop reordering via `@hello-pangea/dnd`, cross-category dragging, category dropdown (Languages/Frontend/Backend/Tools)
- `ExperienceManager.tsx` — CRUD with custom `MonthPicker` component (month/year selection), "Currently working here" toggle for current roles, auto-assigned sort order

### Data Layer

- **Supabase client**: `src/lib/supabase.ts` — lazy-initialized via `getSupabase()` to avoid crash when env vars are missing. `isSupabaseConfigured` boolean for conditional fetching.
- **Hooks**: `src/hooks/usePortfolioData.ts` — `useProjects()`, `useSkills()`, `useExperience()`. Each returns `{ data, loading }`. Returns empty arrays when Supabase isn't configured or has no data. Sections hide themselves when data is empty.
- **Auth hook**: `src/hooks/useAuth.ts` — `useAuth()` returns `{ user, loading, signIn, signOut }`
- **Types**: `src/types/database.ts` — `Project`, `Skill`, `Experience` interfaces + Supabase `Database` type

### Database Schema (Supabase)

Three tables with RLS (Row Level Security): public read, authenticated write. Schema in `supabase-setup.sql`.

| Table | Key columns |
|---|---|
| `projects` | title, description, long_description, thumbnail_url, live_url, github_url, tech_stack (text[]), featured, sort_order |
| `skills` | name, category, proficiency (int), icon, sort_order |
| `experience` | company, role, start_date, end_date (nullable = present), description, sort_order |

`projects` has an `updated_at` trigger. All tables use UUID primary keys and `created_at` defaults.

## Design System

**Direction**: Editorial Dark — near-black background, warm off-white text, single electric orange accent.

### Colors (defined in `src/styles/globals.css` via `@theme`)

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0D0D0D` | Page background |
| `--color-bg-elevated` / `--color-surface` | `#141414` | Navbar, elevated surfaces, form inputs |
| `--color-bg-card` | `#1A1A1A` | Project card backgrounds |
| `--color-text-primary` | `#F0EDE6` | Headings, primary text |
| `--color-text-secondary` | `rgba(240,237,230,0.6)` | Body copy |
| `--color-text-muted` | `rgba(240,237,230,0.35)` | Labels, captions |
| `--color-accent` | `#FF5A36` | CTAs, links, active states |
| `--color-accent-hover` | `#e04d2d` | Button hover |
| `--color-border` | `rgba(240,237,230,0.08)` | Dividers, card borders |
| `--color-border-hover` | `rgba(240,237,230,0.18)` | Hover borders, tech tags |

### Typography

- **Display**: `Playfair Display` (serif) — hero name, section titles, company names, project titles
- **Body**: `DM Sans` (sans-serif) — body copy, labels, buttons, nav
- **Fluid sizing**: `clamp()` throughout — no fixed breakpoint font sizes
- CSS utility classes in `globals.css`: `.type-hero`, `.type-section-title`, `.type-subsection`, `.type-project-title`, `.type-experience-company`, `.type-body`, `.type-label`, `.type-label-accent`

### Animation

- **Scroll reveals**: CSS `.reveal` / `.visible` pattern using IntersectionObserver with **callback refs** (not `useRef` + `useEffect`) — critical for async data that renders after mount
- **Hero**: Framer Motion `stagger` + `fadeUp` variants
- **Navbar**: Framer Motion for mobile menu, `layoutId` for active link indicator
- **Custom cursor**: `src/components/layout/CustomCursor.tsx` — dot + ring following mouse, expands on interactive elements. Only on `pointer: fine` devices.
- **Scroll progress**: `src/components/layout/ScrollProgress.tsx` — thin accent bar at top (z-index 51, above navbar)
- **Reduced motion**: Fully respected via `@media (prefers-reduced-motion: reduce)` in CSS

### Spacing

- Max content width: `1280px`
- Section padding: `clamp(80px, 12vh, 160px)` vertical via `.section-padding`
- Horizontal: `px-6` (24px)

## Key Dependencies

| Package | Purpose |
|---|---|
| `react-router-dom` | Client-side routing |
| `framer-motion` | Animation (hero, navbar) |
| `@supabase/supabase-js` | Database + auth SDK |
| `react-hook-form` | Form state management (contact, admin forms) |
| `lucide-react` | Icons |
| `@hello-pangea/dnd` | Drag-and-drop skill reordering in admin |
| `clsx` + `tailwind-merge` | Class name utilities (`cn()` in `src/lib/utils.ts`) |
| `zod` | Schema validation (installed, not yet used) |

## Environment Variables

Required in `.env.local` (gitignored):

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Server-only (Vercel serverless function at /api/contact)
RESEND_API_KEY=re_...
CONTACT_TO_EMAIL=flaviodenis2003@gmail.com
CONTACT_FROM_EMAIL="Portfolio <onboarding@resend.dev>"   # optional; default verified Resend sender
```

These must also be set in **Vercel project settings** → Environment Variables for production builds.

**Warning**: `VITE_`-prefixed vars are exposed in the client bundle. The Resend key is **server-only** (no `VITE_` prefix) and is read by `api/contact.ts`.

## Git Workflow

**This is a hard rule. Read before every commit.**

1. **Never push directly to `main`.** Always create a feature/fix/chore branch first (`feat/`, `fix/`, `chore/` prefixes — e.g., `feat/contact-email`, `fix/navbar-scroll`).
2. **Never merge a PR yourself — even if the user said "merge and deploy" earlier in the conversation.** Phrases like "merge and deploy", "ship it", or "deploy" authorize the *intent*, not the action. After opening the PR, **stop and wait** for the user to explicitly approve that specific PR ("merge PR #N", "looks good, merge", "approved"). If they haven't said that about the PR in front of you, do not run `gh pr merge`.
3. **The flow is always**: branch → commit → push → open PR → **wait** → user approves the specific PR → then merge.
4. When in doubt, ask. It is always better to pause and confirm than to auto-merge.
5. Commit messages: human tone, no AI co-author tags, no JIRA ticket IDs.
6. Git user for this repo: `denisds73` / `flaviodenis2003@gmail.com` (local override, does not affect global config).

## Conventions

- Path alias: `@/` → `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`)
- Default exports for page and section components
- Named exports for UI primitives (`Input`, `Textarea`, `Card` from barrel `ui/index.ts`)
- `forwardRef` on form input components for react-hook-form compatibility
- Supabase calls always go through `getSupabase()`, never import a raw client
- IntersectionObserver via **`useCallback` ref pattern** (not `useRef` + `useEffect`) — required because sections return `null` when data is empty and render later when async data arrives
- Global git hooks overridden for this repo (`core.hooksPath` set to `.git/hooks` to bypass JIRA commit message enforcement)
- No test framework configured

## Known TODOs

- ~~Contact form email integration~~ **done** — `api/contact.ts` Vercel serverless function sends via Resend; form posts to `/api/contact`
- Replace placeholder social links in `Contact.tsx` with real profile URLs
- Replace `public/resume.pdf` with actual resume
- Old unused components can be cleaned up: `ProjectGrid.tsx`, `ProjectCard.tsx`, `SkillsSection.tsx`, `Timeline.tsx`, `ContactForm.tsx`, `Footer.tsx`, `placeholder.ts`
