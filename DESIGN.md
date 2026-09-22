# DevPulse visual system

## Brand and intent

DevPulse is a quiet developer command center: telemetry clarity meets an editorial workspace. The original mark is a simple pulse line in a rounded terminal-like tile. The wordmark uses a firm “dev”, lighter “pulse”, and cyan punctuation. Interface icons come from Lucide; no emoji navigation or decorative brand logos.

## Color and surfaces

| Role | Dark | Light |
| --- | --- | --- |
| Canvas | `#0b0e14` | `#f2f4f6` |
| Sidebar | `#0e1118` | `#f8f9fa` |
| Card | `#11161e` | `#fcfcfd` |
| Raised surface | `#191f29` | `#e8edf1` |
| Primary text | `#edf1f5` | `#18222c` |
| Secondary text | `#8b95a7` | `#576575` |
| Quiet text | `#647084` | `#687888` |
| Accent | `#58dece` | `#087f77` |
| Link/chart blue | `#86a5ff` | `#476fc0` |

Colors are CSS variables in `src/app/globals.css`, switched through `data-theme`. Dark is the initial preference; users may choose light or system. Soft off-white surfaces avoid glare. Borders use a subdued translucent slate. Errors use rose; caution states use amber. Color always has supporting text, icons, labels, or accessible names.

## Typography and spacing

Geist is the primary face, self-hosted by Next.js. Geist Mono is reserved for statistics, timestamps, usernames, and small telemetry labels. Page headings use 25–29px, the welcome headline 43–54px, section headings 15–18px, and compact body copy 11–13px. Small decorative labels never carry the only explanation of an action. Headings have slightly tightened tracking; tiny uppercase labels use expanded tracking.

The desktop sidebar is 228px, collapsing to 76px. The header is 76px. Content padding is 36px, rising to 50px on wide displays and reducing to 16–20px on mobile. Cards use 18–28px internal spacing; grids use 15–20px gaps. Keep related controls close and separate major sections with 24–33px.

## Components

Cards use 12–15px corners, buttons 7–8px, and small badges 4–6px. Borders define hierarchy; shadows remain almost imperceptible. Main actions are solid cyan, secondary actions use neutral surfaces, and tertiary navigation uses text. Hoverable repository and discovery cards rise 2–3px with a slightly brighter border. Informational cards remain stationary.

The welcome view combines a fine 36px technical grid, two blurred low-opacity gradient fields, and a custom SVG/CSS signal illustration. Cyan, blue, and violet illuminate the background without sitting behind dense body text. Slow 24-second transform motion stays confined to the welcome atmosphere. No Unicorn Studio runtime, particle system, or large external visual dependency is required. Gradient and grid layers cannot intercept input.

## Charts and data

Recharts surfaces use thin dashed grid lines, quiet axes, cyan strokes, soft gradient fills, and themed tooltips. Activity charts count events by UTC date and expose event types in tooltips. Donuts pair with a textual language legend. Bars and calendars expose counts and labels. The pulse ring always displays its numeric value, neutral activity label, factor breakdown, and interpretation caveat.

Heatmaps use a native CSS grid with seven rows and horizontal overflow contained inside the card. Every cell has a date/count label and native tooltip. Levels progress from empty slate to pale emerald. No data is invented to decorate charts; loading uses skeletons and empty results use honest explanations.

## Interaction and motion

Anime.js handles short entrance staggers and numeric transitions (420–500ms). CSS handles small hover/focus feedback. Both the system reduced-motion preference and app setting suppress decorative animation. The command palette uses cmdk inside Radix Dialog for focus management, fuzzy matching, arrow-key selection, Enter, and Escape. Navigation drawers use Radix focus trapping and return focus on close.

Toast feedback is reserved for saves, copies, meaningful settings actions, and timer completion. Note editing shows a quiet inline autosave indicator. Destructive local data actions ask for confirmation. Links, inputs, and buttons receive visible cyan keyboard focus outlines. A skip link goes directly to main content.

## Responsive behavior

At 1500px+, productivity widgets use four columns with a bounded content width. Below 1000px, dense analytics stack, profile actions wrap, and the hero illustration disappears. Below 768px, the fixed sidebar becomes a keyboard-accessible drawer. Stats remain two columns. Below 540px, capability cards become compact rows, widgets stack, notes become a horizontal note picker above the editor, filters use two columns, and the command dialog uses most of the viewport. Long README tables/code and heatmaps scroll within their containers, never the page.

## Accessibility and resilience

Use semantic headings, landmarks, labeled inputs, explicit icon-button names, current-page navigation, and accessible dialogs. Tooltips supplement visible information rather than replacing it. External URLs use safe protocols. Skeletons have status text; errors have alerts and retry actions; no results have useful next steps. Offline saved metadata is explicitly described as a snapshot. Reusable boundaries keep a failed API section from blanking the workspace.
