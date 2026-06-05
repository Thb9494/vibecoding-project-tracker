# Vibecoding Project Tracker — Design

**Status:** Hackathon starter design doc · fill in the **`<TODO>`** sections before you tag `design-done`.

**Why this file exists.** This tracker is your tool. It should look like *your* tool — not a generic Kanban with default Tailwind blue. Twenty minutes of design decisions here will be visible on every screen for the next six weeks of Module 5.

**Who owns this.** Person B, during the same window the rest of the team is reviewing the PRD. By the time the team converges to start M4 (`data-model`), this file should be filled in and the colors should already be in `tailwind.config.js`.

---

## 1. Mood / vibe

One sentence that captures the feeling the tracker should leave you with.

Calm, precise, and effortlessly in control — the interface recedes so the work, not the chrome, takes center stage.

Two or three references that capture the vibe (links to dribbble shots, screenshots of apps you admire, Pinterest boards — anything visual):

- [Linear](https://linear.app) — calm, dense, keyboard-first project tooling with hairline borders and quiet color.
- [Apple's macOS system UI / Reminders](https://www.apple.com/macos) — paper-like canvas, tonal layering, no heavy shadows.
- [Notion](https://www.notion.so) — typography-led hierarchy that stays out of the way.

Anti-references — what we are explicitly **not** trying to look like:

- Default Tailwind dashboards: stock blue, `rounded-3xl` cards, heavy drop shadows, and loud gradients, neon, or glassmorphism.

## 2. Color palette

These are the colors the build milestones will reference. Once chosen, paste the hex values into `tailwind.config.js` so the rest of the team can use Tailwind utility classes (e.g. `bg-brand-primary`, `border-due-warning`).

### Brand

| Token | Hex | Where it shows up |
|---|---|---|
| `brand-primary` | `#0058bc` | Header, "+" button, focus rings |
| `brand-accent` | `#0070eb` | Highlights, hover states, links |
| `surface-page` | `#faf9fe` | Page background |
| `surface-card` | `#ffffff` | Card background |
| `text-primary` | `#1a1b1f` | Body text |
| `text-muted` | `#414755` | Captions, dates, counts |

### Task type (M6 `tag-style`)

| Token | Hex | When used |
|---|---|---|
| `type-feature` | `#4c4aca` | Cards tagged `feature` (accent stripe + icon) |
| `type-bug` | `#c64f00` | Cards tagged `bug` (accent stripe + icon) |

### Due-date states (M8 `due-tint`)

| Token | Hex | When used |
|---|---|---|
| `due-safe` | `#3a8a5f` | More than 2 days out |
| `due-warning` | `#c64f00` | Less than 24 hours |
| `due-overdue` | `#ba1a1a` | Past due |
| `due-neutral` | `#717786` | Done (overrides date) |

## 3. Typography

| Role | Font | Why |
|---|---|---|
| Heading | `Inter` (SemiBold 600, tightened `-0.02em`) | One typeface across the system; tight tracking on large sizes gives a premium, editorial feel. |
| Body | `Inter` (Regular 400) | Mathematical precision and exceptional legibility in data-heavy grids and sidebars. |
| Monospace (tags, badges, code) | `Inter` for tags/badges (SemiBold caption); `ui-monospace, SF Mono` for code | Badges stay on-brand in Inter; true monospace is reserved for copied prompt context and code. |

Suggested sizes (override only if the design demands it):

- Page title: 24 px / semibold
- Section header: 16 px / semibold uppercase
- Card title: 14 px / medium
- Body: 14 px / regular
- Caption: 12 px / regular muted

## 4. Component principles

One short sentence per element. These set the tone for the build phase — Person A's modal and Person B's anchor board should both feel like they came from this doc.

- **Cards:** Light, almost weightless — a 1px hairline border (`outline-variant`) on white, no shadow except a subtle `0 2px 4px rgba(0,0,0,0.04)` lift on hover.
- **Buttons:** Solid `brand-primary` fill with white text, no gradient; `rounded-md` (8px) with generous padding. Secondary is a soft gray wash; ghost is text-only until hover.
- **Modal:** Centered, `max-width-md`, on a slate backdrop; high-elevation shadow (`0 12px 32px rgba(0,0,0,0.12)`); enters with a 95%→100% scale-up and fade.
- **Empty states:** Dashed hairline border, muted text, never sad — a quiet nudge to keep going.
- **Drag affordance (if used):** None — status changes via a dropdown; cards stay calm and in place.

## 5. Voice / microcopy

Three lines of microcopy that capture the tone of the product. Keep it short — these are the words a stressed user reads at 11pm.

| Where | Text |
|---|---|
| "+" button label | + Task |
| Empty column placeholder | Nothing here yet — keep going. |
| Toast after "Copy as Prompt Context" | Copied. Paste it into your AI and pick up where you left off. |
| Confirm-delete message | Delete this task? This can't be undone. |
| Handoff toast (M7 `task-owner`) | Handed off to {name}. They've got it. |

## 6. Logo / wordmark

The tracker probably doesn't need a logo, but it does need a name and a wordmark style.

- **Product name:** Anchor (sync with PRD §11 team identity once the team name is set)
- **Wordmark style:** Just the name set in Inter SemiBold, `brand-primary` color, no icon — tight tracking, lowercase.

## 7. Out of scope (this hackathon)

To keep design tight, the following are explicitly not part of `design-done`:

- A dark mode toggle. Pick one mode and ship it.
- Multiple themes. One brand, applied consistently.
- Animations beyond a 200 ms fade on toast notifications.
- A custom icon set. Use [Lucide icons](https://lucide.dev) via Tailwind classes if you need any.

---

*DESIGN.md version: hackathon-starter v1*