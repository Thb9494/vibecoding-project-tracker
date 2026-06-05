# Vibecoding Project Tracker — Design

**Status:** `design-done` — design system locked. Build milestones (M3, M4, M6, M8) reference the tokens below.

**Design system:** *Precision Minimalist* — engineered for deep focus and high-density information management. A calm, "invisible" interface that recedes to let project data take center stage.

**Why this file exists.** This tracker is your tool. It should look like *your* tool — not a generic Kanban with default Tailwind blue. The decisions here are visible on every screen for the next six weeks of Module 5.

**Who owns this.** Person B. By the time the team converges to start M4 (`data-model`), the colors below should already be in `tailwind.config.js`.

---

## 1. Mood / vibe

One sentence that captures the feeling the tracker should leave you with.

A calm, paper-like workspace where Apple-inspired minimalism makes the interface disappear so the project data — and nothing else — holds your attention.

References that capture the vibe:

- **Linear** — quiet density, hairline borders, keyboard-first calm.
- **Apple Human Interface Guidelines** — San Francisco blue, generous whitespace, premium typography.
- **Notion (in its quietest, default state)** — neutral canvas, content over chrome.

Anti-references — what we are explicitly **not** trying to look like:

- A default Tailwind-blue Kanban with heavy drop shadows.
- Loud gradients, neon accents, or playful "startup" decoration.
- Dense enterprise grids (Jira) with borders on every cell.

## 2. Color palette

The palette is rooted in a neutral grayscale for a professional, paper-like canvas, using a sophisticated "San Francisco" blue (`primary`) for intent and actions. Semantic colors are applied with restraint: high-chroma hues only for small status indicators (dots, thin bars) and **low-opacity washes (10–15%)** for background fills, so text stays legible and the UI stays quiet. Light mode only.

Paste these hex values into `tailwind.config.js` so the team can use utility classes (e.g. `bg-brand-primary`, `border-due-warning`).

### Brand

| Token | Hex | Where it shows up |
|---|---|---|
| `brand-primary` | `#0058bc` | Header, "+" button, focus rings, primary buttons |
| `brand-accent` | `#4c4aca` | Highlights, hover states, links |
| `surface-page` | `#faf9fe` | Page background (paper canvas) |
| `surface-card` | `#ffffff` | Card background (with 1px `#c1c6d7` hairline, not a shadow) |
| `text-primary` | `#1a1b1f` | Body text |
| `text-muted` | `#414755` | Captions, dates, counts |

### Task type (M6 `tag-style`)

Rendered as pill badges (caption font) on a **12% opacity wash** of the hue, with the solid hue used for the icon and accent stripe.

| Token | Hex | When used |
|---|---|---|
| `type-feature` | `#4c4aca` | Cards tagged `feature` (indigo stripe + icon) |
| `type-bug` | `#c64f00` | Cards tagged `bug` (orange stripe + icon) |

### Due-date states (M8 `due-tint`)

A muted green and a dedicated amber are **added** here — the base palette ships only blue/indigo/orange/red, so on-track and warning states need their own hues. Amber is kept distinct from `type-bug` orange so a warning never reads as a bug.

| Token | Hex | When used |
|---|---|---|
| `due-safe` | `#2e7d52` | More than 2 days out (on track) |
| `due-warning` | `#b26a00` | Less than 24 hours (amber) |
| `due-overdue` | `#ba1a1a` | Past due (error red) |
| `due-neutral` | `#717786` | Done (overrides date) |

### Status dots (Kanban columns)

A small filled dot next to each column header and on each card, echoing the column it lives in.

| Status | Hex |
|---|---|
| To Do | `#717786` (gray) |
| In Progress | `#0058bc` (blue) |
| Review | `#4c4aca` (indigo) |
| Done | `#2e7d52` (green) |

### Full token reference

The complete *Precision Minimalist* token set, for any surface or state not covered above. Use the role-based tokens (`brand-*`, `type-*`, `due-*`) in components; reach for these raw tokens only when you need a specific tonal step.

**Surfaces & neutrals**

| Token | Hex |
|---|---|
| `surface` / `background` | `#faf9fe` |
| `surface-dim` | `#dad9df` |
| `surface-bright` | `#faf9fe` |
| `surface-container-lowest` | `#ffffff` |
| `surface-container-low` | `#f4f3f8` |
| `surface-container` | `#eeedf3` |
| `surface-container-high` | `#e9e7ed` |
| `surface-container-highest` | `#e3e2e7` |
| `surface-variant` | `#e3e2e7` |
| `on-surface` | `#1a1b1f` |
| `on-surface-variant` | `#414755` |
| `on-background` | `#1a1b1f` |
| `outline` | `#717786` |
| `outline-variant` | `#c1c6d7` |
| `inverse-surface` | `#2f3034` |
| `inverse-on-surface` | `#f1f0f5` |
| `surface-tint` | `#005bc1` |

**Primary**

| Token | Hex |
|---|---|
| `primary` | `#0058bc` |
| `on-primary` | `#ffffff` |
| `primary-container` | `#0070eb` |
| `on-primary-container` | `#fefcff` |
| `inverse-primary` | `#adc6ff` |
| `primary-fixed` | `#d8e2ff` |
| `primary-fixed-dim` | `#adc6ff` |
| `on-primary-fixed` | `#001a41` |
| `on-primary-fixed-variant` | `#004493` |

**Secondary**

| Token | Hex |
|---|---|
| `secondary` | `#4c4aca` |
| `on-secondary` | `#ffffff` |
| `secondary-container` | `#6664e4` |
| `on-secondary-container` | `#fffbff` |
| `secondary-fixed` | `#e2dfff` |
| `secondary-fixed-dim` | `#c2c1ff` |
| `on-secondary-fixed` | `#0c006a` |
| `on-secondary-fixed-variant` | `#3631b4` |

**Tertiary**

| Token | Hex |
|---|---|
| `tertiary` | `#9e3d00` |
| `on-tertiary` | `#ffffff` |
| `tertiary-container` | `#c64f00` |
| `on-tertiary-container` | `#fffbff` |
| `tertiary-fixed` | `#ffdbcc` |
| `tertiary-fixed-dim` | `#ffb595` |
| `on-tertiary-fixed` | `#351000` |
| `on-tertiary-fixed-variant` | `#7c2e00` |

**Error**

| Token | Hex |
|---|---|
| `error` | `#ba1a1a` |
| `on-error` | `#ffffff` |
| `error-container` | `#ffdad6` |
| `on-error-container` | `#93000a` |

**Added semantics (not in base palette)**

| Token | Hex | Purpose |
|---|---|---|
| `success` | `#2e7d52` | On-track due dates, Done status |
| `success-container` | `#b6f0cd` | 10–15% wash behind success text/badges |
| `warning` | `#b26a00` | Due within 24h (amber) |
| `warning-container` | `#ffe2b8` | 10–15% wash behind warning text/badges |

## 3. Typography

**Inter** across all levels — chosen for its mathematical precision and exceptional legibility in data-heavy contexts. Tighten letter-spacing on larger headings for a premium, editorial feel. Use Medium (500) / SemiBold (600) sparingly to build hierarchy without leaning on color.

| Role | Font | Why |
|---|---|---|
| Heading | Inter | Precise, editorial at large sizes with tightened tracking. |
| Body | Inter | Highly legible at 14px in dense grids and sidebars. |
| Mono / tags & badges | Inter | One typeface keeps the UI quiet; badges use the SemiBold caption style instead of a separate mono font. |

Type scale (size / weight / line-height / letter-spacing):

| Role | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|
| Display | 48px | 700 | 1.1 | -0.02em |
| H1 | 32px | 600 | 1.2 | -0.02em |
| H1 (mobile) | 24px | 600 | 1.2 | — |
| H2 | 24px | 600 | 1.3 | — |
| H3 | 20px | 600 | 1.3 | — |
| H4 | 16px | 600 | 1.4 | — |
| Body (large) | 16px | 400 | 1.5 | — |
| Body (medium) | 14px | 400 | 1.5 | — |
| Caption | 12px | 500 | 1.4 | 0.01em |
| Button | 14px | 600 | 1 | -0.01em |

Usage: `14px` body-medium is the workhorse for project grids and sidebars; reserve `16px` body-large for long-form descriptions and empty states.

## 4. Component principles

One short sentence per element. These set the tone for the build phase — Person A's modal and Person B's anchor board should both feel like they came from this doc.

- **Cards:** Light and almost weightless — structure comes from a 1px `outline-variant` (`#c1c6d7`) hairline, not a shadow; add a `0 2px 4px rgba(0,0,0,0.04)` micro-shadow only on hover.
- **Buttons:** Primary = solid `brand-primary` with white text, no gradient; Secondary = subtle gray wash (`surface-container` `#eeedf3`) with primary or dark-gray text; Ghost = transparent, text-only, background appears on hover. Radius `0.5rem`.
- **Modal:** Centered, `max-width-md`, on a dark backdrop (~50% opacity); high-elevation shadow `0 12px 32px rgba(0,0,0,0.12)`; enters with a subtle scale-up (95% → 100%) + fade so it feels lightweight.
- **Inputs:** White background, 1px `#d1d1d6` border; focus = 1px `brand-primary` border + 2px soft outer glow at 10% opacity; 36px height standard, 44px for large/touch forms.
- **Avatars & badges:** Avatars are circular with a 1px inner border so they don't bleed into light backgrounds; badges use the SemiBold caption style on a 10–15% opacity wash of their semantic color.
- **Empty states:** Dashed `outline-variant` border, muted text, encouraging not sad.
- **Drag affordance:** None — tasks move via a status dropdown (see PRD).

### Elevation & depth

Depth comes from **tonal layering** and **micro-shadows**, never colored shadows — every layer should feel like natural light on a flat white surface.

- **Level 0 — Base:** Canvas background (`surface-page` `#faf9fe`).
- **Level 1 — Surface:** Cards and content areas. 1px hairline border (`#c1c6d7`) instead of a shadow.
- **Low:** Card hover. `0 2px 4px rgba(0,0,0,0.04)`.
- **Medium:** Dropdowns, popovers. `0 4px 12px rgba(0,0,0,0.08)`.
- **High:** Modals. `0 12px 32px rgba(0,0,0,0.12)`.

### Shapes & radius

"Soft-Modern" shape language. Base radius `0.5rem` for buttons, inputs, and cards; `pill` for badges and tags to distinguish them from interactive buttons.

| Token | Value | Use |
|---|---|---|
| `sm` | 0.25rem | Small chips, inner elements |
| `DEFAULT` | 0.5rem | Buttons, inputs, cards |
| `md` | 0.75rem | Larger cards, panels |
| `lg` | 1rem | Modals, prominent containers |
| `xl` | 1.5rem | Hero / feature surfaces |
| `full` | 9999px | Badges, tags, avatars (pill) |

### Layout & spacing

An **8px linear scale** for layout with a **4px step** for component-level fine-tuning. Layout is a **fluid-fixed hybrid**: sidebars are fixed (240–280px) while the main content area is fluid with a **1440px max width** to keep line lengths readable. Density is a priority — use `8px` for internal component padding and `16px` for the gap between logical sections.

### Iconography

- **Set:** [Lucide](https://lucide.dev) icons only.
- **Weight:** 1.5px–2px stroke.
- **Consistency:** Optically centered within a 20px or 24px bounding box.

### Motion & interaction

- **Transitions:** `200ms` for most state changes (hover, toggle).
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (standard easing).
- **Entry:** Modals scale up (95% → 100%) and fade in; toasts fade in over 200ms.

## 5. Voice / microcopy

Three-plus lines of microcopy that capture the tone — quiet, confident, and human; the words a stressed user reads at 11pm.

| Where | Text |
|---|---|
| "+" button label | `+ Task` |
| Empty column placeholder | `Nothing here yet — keep going.` |
| Toast after "Copy as Prompt Context" | `Copied. Paste it into your AI to pick up where you left off.` |
| Confirm-delete message | `Delete this task? This can't be undone.` |
| Handoff toast (M7 `task-owner`) | `Handed off to {name}. They've got it.` |

## 6. Logo / wordmark

- **Product name:** Gracebay Garage (matches PRD §11 team identity).
- **Wordmark style:** Just the name set in Inter SemiBold, `brand-primary` color, tightened letter-spacing, no icon.

## 7. Out of scope (this hackathon)

To keep design tight, the following are explicitly not part of `design-done`:

- A dark mode toggle. Light mode only — ship it.
- Multiple themes. One brand, applied consistently.
- Animations beyond the 200ms transitions and toast fades specified above.
- A custom icon set. Use [Lucide icons](https://lucide.dev) if you need any.

---

*DESIGN.md version: hackathon-starter v1 · design system: Precision Minimalist*
