# DevPulse

**See the pulse behind the code.** A personal developer intelligence workspace for exploring GitHub developers, repositories, languages, and public activity.

## What you can do

- Analyze any public GitHub profile: stars, forks, followers, primary languages, public events, and repository rankings.
- Explore a 30-day Developer Pulse score with an explicit breakdown. The score measures visible activity, never skill.
- Inspect 7/30/90-day activity, event distributions, UTC weekday/hour patterns, and an activity heatmap.
- Enable the official contribution calendar with an optional server-side GitHub token.
- Search repositories with language, stars, owner, update, topics, archived/fork filters, sorting, pagination, and grid/list views.
- Open repository details, language-byte analytics, and a safe Markdown README preview.
- Save developers and repositories, maintain recent searches, and write searchable, pinned, tagged, autosaving notes.
- Use a wall-clock-based focus timer, local clock, quick notes, and configurable dashboard widgets.
- Navigate with a collapsible sidebar, mobile drawer, and fuzzy command palette (`Ctrl/Cmd + K`).
- Choose dark, light, or system appearance and reduced motion.

## Run locally

Node.js 22.9+ and npm are required (verified using Node.js 24).

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). Start with a GitHub username; no sign-in, account, database, or token is required.

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

## Optional environment

Copy `.env.example` to `.env.local` and optionally set:

```dotenv
GITHUB_TOKEN=
```

Use a GitHub token authorized to read public profile/contribution information. No write scopes are needed. The token is read only inside the server API layer; never prefix it with `NEXT_PUBLIC_`, paste it into the UI, or commit it. Invalid or insufficient tokens produce a clear error or calendar fallback.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Welcome workspace or configured default profile |
| `/developer/{username}` | Developer overview |
| `/analyzer?username={username}` | Detailed public activity analysis |
| `/explore?q={query}` | Repository discovery |
| `/repository/{owner}/{repo}` | Repository metadata and README |
| `/saved` | Local saved collection |
| `/notes` | Local notes |
| `/settings` | Appearance, widgets, API status, and data controls |

## Stack and structure

Next.js App Router, React, strict TypeScript, Tailwind CSS, CSS design tokens, Zustand persist, TanStack Query, Lucide, Anime.js, Recharts, Radix Dialog, cmdk, Sonner, and react-markdown. Accessible Radix primitives follow the composition approach used by shadcn/ui; this project keeps its own styled components rather than shipping an entire component suite.

```text
src/app/                  Routes, server API handler, global design system
src/components/           Shell, feature views, charts, and shared components
src/lib/github/server.ts  Server-only GitHub transport and errors
src/lib/github/queries.ts Client queries, deduplication, and API status
src/lib/github/types.ts   Typed GitHub and application response models
src/lib/github/analytics.ts Pure analytics and ranking functions
src/lib/utils.ts          Formatting and validation
src/stores/workspace.ts   Persisted preferences, notes, saved items, and history
tests/                    Deterministic analytics and security utility tests
```

## Data and API behavior

Only official GitHub REST and GraphQL endpoints are used. REST works without authentication, subject to GitHub limits. Search has a separate rate-limit bucket. The sidebar reports the most recently observed request bucket; Settings shows the core bucket and reset time.

Developer retrieval pages through at most **300 recently updated owned repositories** and **300 public events**. The API may expose fewer events and only a limited recent window. The UI reports partial coverage and individual failures; a missing event feed does not remove the profile. Search exposes up to 1,000 matches, 30 per page. Name/creation sorting and homepage filtering operate on the current page and are labeled accordingly.

Client requests stay fresh for five minutes, deduplicate across views, remain cached in memory for 30 minutes, and do not refetch on window focus. Manual refresh invalidates active data. Validation, authentication, not-found, and rate-limit errors are not automatically retried. Temporary failures get at most one retry. Server requests time out after 15 seconds each.

Language percentages on profiles represent **repository primary-language frequency**, excluding repositories without a language. Repository detail percentages represent **GitHub language bytes**, not exact lines of code. Open issue counts can include pull requests. Push event counts are not commit counts; GitHub event payloads do not consistently expose individual commits.

Pulse is deterministic over the last 30 days: public events contribute up to 40 points (2 each), distinct activity days up to 30 (3 each), pushed repositories up to 20 (2 each), and event variety up to 10 (2 per type). No LLM or invented statistics are used. Missing data lowers observed coverage and must not be interpreted as lack of work.

The authenticated contribution calendar is separate from the public-event heatmap. It uses `contributionsCollection` and falls back independently if token access is unavailable. No GitHub HTML is scraped.

## Privacy and safety

Notes, favorites, recent searches, and preferences stay in this browser’s local storage. Saved developer/repository metadata is a small snapshot; large API responses are not persisted. No tracking scripts, database, hidden collection, or LLM service is included. Searches travel through this app’s server to GitHub. Profile avatars load from GitHub.

Local storage is device/browser-specific and is not encrypted or backed up. Clearing browser data removes the workspace. Saved snapshots and notes remain accessible when GitHub is unavailable, provided the app is already loaded; this is not an offline-installable service-worker app.

README raw HTML is skipped. Links accept only HTTP(S), external links use `noopener noreferrer`, and README images appear as links to avoid silently loading arbitrary third-party trackers. Tokens never reach browser JavaScript. Notifications are off until the user explicitly enables them in Settings; no sounds play.

## Deploy on Vercel

Import this repository into Vercel, choose the detected **Next.js** framework, and use `npm run build`. Optionally add `GITHUB_TOKEN` as a server environment variable and redeploy. No filesystem persistence or database is needed. A standard Node.js host can run `npm run build` followed by `npm start` as well.

## Screenshots

Capture the welcome workspace, a real developer overview, the repository explorer, and mobile notes after launch. Screenshots should use current public GitHub data and avoid personal notes. The visual language and responsive rules are documented in [DESIGN.md](DESIGN.md).

## Known limits and future directions

- GitHub limits and incomplete public event history bound every activity statistic.
- A valid server token is required to verify and use authenticated contribution calendars.
- Timer sessions currently live in the mounted dashboard and reset when leaving it; elapsed time uses a deadline to resist background-tab throttling.
- Notes and collections are local to one browser. Optional export/import and cross-device sync are future enhancements.
- Search ranking by name or creation time is limited to the current page, because GitHub search does not offer these global sorts.
- An operator may add deployment-specific abuse protection for a high-traffic public installation.

## License

License selection is pending the repository owner’s decision. Add a `LICENSE` file before distributing under a specific open-source license.
