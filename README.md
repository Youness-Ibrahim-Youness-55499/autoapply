# Jobman

Jobman helps active job seekers organize applications and prepare better application materials. The product is being built incrementally, with user review required before any future submission workflow.

## Current foundation

Phase 1 provides:

- public landing page
- email signup and login through Supabase
- persistent authenticated sessions
- protected `/app` routes
- responsive workspace navigation
- Overview, Applications, Profile, Documents, and Settings foundation pages
- shared loading, error, and empty-state components
- per-pull-request frontend verification in GitHub Actions

The authenticated pages deliberately avoid fake records, statistics, AI output, and controls that do not work yet.

## Technology

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Supabase
- Python, FastAPI, and PyMuPDF for isolated PDF CV extraction
- pnpm

## Local setup

Requirements:

- Node.js 22
- pnpm 11
- a Supabase project with email authentication configured

Install dependencies:

```powershell
pnpm install
```

Copy the environment template:

```powershell
Copy-Item .env.example .env.local
```

Add your Supabase project URL, publishable key, and CV parser URL to `.env.local`. Never add a service-role key to the frontend.

The PDF CV parser is an independently deployable service under `services/cv-parser/`. Follow its README to run it locally on `http://localhost:8000` before testing profile extraction.

Start the development server:

```powershell
pnpm dev
```

Open `http://localhost:5173/`. The authenticated workspace is at `http://localhost:5173/app`.

## Verification

Run the same frontend verification used by GitHub Actions:

```powershell
pnpm verify
```

This performs TypeScript checking and a production Vite build.

Other useful commands:

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the local development server |
| `pnpm typecheck` | Run TypeScript checking |
| `pnpm build` | Type-check and create a production build |
| `pnpm preview` | Preview the production build locally |

## Authenticated routes

| Route | Current purpose |
| --- | --- |
| `/app` | Workspace overview |
| `/app/applications` | Application tracker foundation |
| `/app/profile` | Candidate profile foundation |
| `/app/documents` | Private document workflow foundation |
| `/app/settings` | Account and workspace settings foundation |

## Next product phase

Phase 2 connects the Applications page to the authenticated user's private Supabase records, beginning with a read-only list and a truthful empty state.
