# Fasting Tracker — UX/UI Redesign Plan

> **Scope:** Visual and layout redesign only. The existing `fasting_app_data` localStorage schema is preserved exactly — no data migration required. All existing React state, hooks, and logic remain intact; only presentation layer changes.

---

## 1. Design Philosophy

The current app is functional but feels like a developer prototype. The redesign targets three pillars:

- **Trust** — Clean typography, purposeful whitespace, and polished micro-interactions signal a quality product. Users should feel confident putting their health data here.
- **Clarity** — Every screen has one primary action. Secondary information is accessible but not competing for attention.
- **Calm** — A fasting app is used during a period of restraint. The visual language should feel serene and focused, not gamified or loud.

---

## 2. Visual Identity

### Color System

Replace the current arbitrary slate/blue palette with a deliberate, semantic token system:

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--bg-base` | `#F9F7F4` (warm white) | `#0E0F11` (near-black) | Page background |
| `--bg-surface` | `#FFFFFF` | `#17191D` | Cards, modals |
| `--bg-elevated` | `#F2EFE9` | `#1F2127` | Input fields, secondary cards |
| `--border` | `#E4DED5` | `#2C2F36` | Dividers, card borders |
| `--text-primary` | `#1A1714` | `#F0EDEA` | Headlines, active labels |
| `--text-secondary` | `#6B6560` | `#8A8580` | Captions, metadata |
| `--accent` | `#3D6B5C` (forest green) | `#4E8F78` | Primary CTA, active fasting state |
| `--accent-warn` | `#B84B3C` (muted red) | `#D45F4F` | Stop button, destructive actions |
| `--accent-gold` | `#C49A3C` | `#D4A94C` | Streak, achievements |
| `--success` | `#3D8C5C` | `#4EA872` | Goal achieved ring |

**Rationale:** Forest green as the primary accent ties to health and nature. The warm off-white background avoids the cold clinical feel of pure white. Both modes feel cohesive rather than inverted.

### Typography

Adopt a two-font system via Google Fonts:

- **Display / Headings:** `DM Serif Display` — elegant, trustworthy, conveys gravitas without being stiff. Used for the main timer and section headers.
- **UI / Body:** `DM Sans` — modern, highly legible at small sizes, pairs naturally with DM Serif. Used for all labels, buttons, and metadata.

**Type Scale (rem-based):**

| Role | Size | Weight | Tracking |
|---|---|---|---|
| Timer display | 4.5rem | 400 (Serif) | -0.02em |
| Section header | 1.25rem | 600 (Sans) | -0.01em |
| Body / label | 0.9375rem | 400 (Sans) | 0 |
| Caption / meta | 0.8125rem | 400 (Sans) | +0.01em |
| Micro / badge | 0.6875rem | 600 (Sans) | +0.03em |

### Iconography

Replace Lucide icons with a consistent set at 20px with 1.5px stroke weight. Icons should never be filled — outline-only to maintain lightness. Keep the same Lucide library; simply enforce size and stroke consistency throughout.

### Spacing & Grid

Adopt an **8px base grid**. All padding, margin, and gap values are multiples of 8 (4px for micro-spacing only). This creates invisible rhythm that users perceive as "polished" without knowing why.

Card corner radius: `16px` for primary containers, `10px` for inputs and chips, `9999px` for pill buttons.

---

## 3. Layout Redesign

### 3a. Overall Structure

**Current:** Single scrollable column with elements stacked vertically, modal overlays.

**Redesigned:** A **fixed-height single-screen layout** on desktop that eliminates scrolling on the primary view. On mobile it remains a natural scroll. Structure:

```
┌─────────────────────────────────────────────┐
│  HEADER (56px, sticky)                      │
│  Logo                    [History] [Settings]│
├─────────────────────────────────────────────┤
│  HERO ZONE (flex, centered, ~60vh)          │
│                                             │
│    ┌── Streak Badge ──┐                     │
│    │  🔥 5-Day Streak │                     │
│    └──────────────────┘                     │
│                                             │
│         [PROGRESS RING — large]             │
│           HH : MM : SS                      │
│         16:8 · 14h 23m elapsed              │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │  [ START FAST ]  or  [ STOP ]   │      │
│    └─────────────────────────────────┘      │
│                                             │
│    Forgot to start? Set time manually       │
│                                             │
├─────────────────────────────────────────────┤
│  SUMMARY STRIP (3 stat cards, ~100px)       │
│  [ Longest Fast ]  [ Total Fasts ]  [ Avg ] │
├─────────────────────────────────────────────┤
│  FOOTER (40px)                              │
│  thehelpfuldev.com          Version 1.1.0   │
└─────────────────────────────────────────────┘
```

The summary strip is new — it displays computed aggregate stats from the existing `history` array in localStorage, requiring no new data storage.

### 3b. Header

**Current:** Logo left, two icon buttons right with labels.

**Redesigned:**
- Height: `56px`, `padding: 0 24px`
- Logo: wordmark in `DM Serif Display`, medium weight, `--text-primary`
- Right side: icon-only buttons in `--bg-elevated` pill backgrounds (`32px × 32px`), no text labels — rely on tooltips (title attribute) for accessibility
- Bottom border: `1px solid --border`, no `backdrop-blur` (it causes visual noise on warm backgrounds; instead use `background: --bg-base` with `box-shadow: 0 1px 0 --border`)

### 3c. Progress Ring

**Current:** One large SVG ring, color transitions red → green.

**Redesigned:**
- Ring background track: `--border` color (subtle, not invisible)
- Ring fill: starts as `--accent` (forest green), goal-achieved state brightens the same hue rather than changing color — a 20% lightness increase on `--success`
- Ring thickness: increase stroke width from current value to `10px` — feels more substantial
- Add a soft **glow pulse** behind the ring only during active fasting: a radial gradient `--accent` at 10% opacity, `border-radius: 50%`, animated opacity 0.4 → 0.8 → 0.4 over 4s. This provides "alive" feedback without being distracting.
- Timer digits: `DM Serif Display`, `4.5rem`. Centered below ring or overlaid inside ring (evaluate both in implementation; overlay is bolder, below is more legible at small sizes).
- Remove the fasting ratio display (e.g. "16:8") from inside/near the ring. Move it to a small pill badge above the ring.

### 3d. Action Button

**Current:** Full-width-ish rounded button, blue when idle, dark red when active.

**Redesigned:**
- Width: `220px` fixed, not full-width — gives it presence without overwhelming
- Height: `56px`
- Border radius: `9999px` (pill)
- Idle state: `background: --accent`, `color: white`, label "Begin Fast"
- Active state: `background: --accent-warn`, label "End Fast", preceded by a `◼` stop icon
- Hover: 4% lighter background, subtle `box-shadow` lift (`0 4px 16px rgba(accent, 0.35)`)
- Active press: scale `0.98`, instant (no delay)
- **No text transform / uppercase** — sentence case reads as more human and less app-like

### 3e. Goal Achievement State

**Current:** Bouncing alert box appears below button.

**Redesigned:**
- Remove the alert box entirely — it competes with the ring and is redundant
- Replace with: ring glow intensifies, timer text color shifts to `--success`, and a **single subtle toast notification** slides in from the bottom of the screen: `"Goal reached · Well done"` — 3 second auto-dismiss, no interaction required
- Toast style: `--bg-surface`, `border: 1px solid --success`, `border-radius: 12px`, `padding: 12px 20px`, drop shadow, slide-up + fade-in animation

### 3f. Streak Counter

**Current:** Pill badge with flame emoji at top of main area.

**Redesigned:**
- Keep placement above the ring
- Replace emoji with the Lucide `Flame` icon (`--accent-gold`, 18px)
- Show streak only if ≥ 1; zero streak shows nothing (empty state is cleaner than "0 day streak")
- Style: `background: rgba(--accent-gold, 0.12)`, `color: --accent-gold`, `border-radius: 9999px`, `padding: 6px 14px`
- Text: `"5-day streak"` — lowercase, `DM Sans 600`, `0.8125rem`

### 3g. Protocol / Mode Chip

**Current:** Text showing mode with info tooltip.

**Redesigned:**
- Compact chip directly above the timer: `"16:8 Protocol"` with a small `Info` icon right-aligned
- Clicking the chip opens Settings (avoids the separate tooltip hover pattern which is invisible on mobile)
- Style: `--bg-elevated`, `border: 1px solid --border`, `border-radius: 9999px`, `padding: 5px 12px`

### 3h. Summary Strip (New)

Three stat cards in a horizontal strip below the hero zone. Stats are derived from existing `history` data:

| Card | Stat | Source |
|---|---|---|
| Longest Fast | Maximum `duration` in history | `history` array |
| Total Fasts | Count of all history entries | `history.length` |
| Average Duration | Mean `duration` of completed fasts | `history` array |

Each card:
- `background: --bg-surface`, `border: 1px solid --border`, `border-radius: 16px`, `padding: 16px 20px`
- Top label: caption text, `--text-secondary`
- Bottom value: `1.5rem`, `DM Serif Display`, `--text-primary`

On mobile, cards stack vertically or become a horizontal scroll row.

---

## 4. Modal Redesign

All three modals (History, Settings, Edit Entry) share a unified system:

### 4a. Overlay & Container

**Current:** Dark semi-transparent full-screen overlay, centered white box.

**Redesigned:**
- Overlay: `rgba(0,0,0, 0.5)`, `backdrop-filter: blur(4px)` — frosted effect that preserves spatial context
- Container: slides up from bottom on mobile (bottom sheet pattern), centered on desktop
- Mobile sheet: `border-radius: 20px 20px 0 0`, `max-height: 90vh`, `overflow-y: auto`, drag handle bar at top (decorative `4px × 32px` pill, `--border` colored)
- Desktop modal: `border-radius: 20px`, `max-width: 480px`, `width: calc(100% - 48px)`
- Entrance animation: `transform: translateY(100%)` → `translateY(0)` with `cubic-bezier(0.32, 0.72, 0, 1)` (iOS sheet curve), `300ms`
- Exit: reverse, `200ms`

### 4b. History Modal

**Current:** Scrollable list of text entries with edit/delete icon buttons.

**Redesigned:**
- Header row: `"Fasting History"` (h2, DM Serif) left, close `×` icon right
- Each history entry becomes a **card**:
  - Left: date in large format `"Mar 15"` + weekday small below
  - Center: duration in `DM Serif Display`, `1.5rem`; below it a subtle badge `"Goal Met ✓"` or `"Incomplete"` in appropriate color
  - Right: three-dot `⋯` menu button opening an inline action menu with Edit and Delete
- Entries separated by `12px` gap, not divider lines
- Empty state: centered illustration placeholder + `"No fasts recorded yet. Start your first fast above."` — no list at all

### 4c. Settings Modal

**Current:** Dropdown for protocol, clear history button, Ko-fi link.

**Redesigned:**
- Section heading: `"Protocol"` with a `Settings` icon
- Protocol selector: Replace `<select>` dropdown with **segmented control** — horizontal row of pill buttons for each preset (16:8, 18:6, 20:4, 12:12), active state: `--accent` background + white text, inactive: `--bg-elevated`
- Danger zone: `"Clear All History"` button styled as `border: 1px solid --accent-warn`, `color: --accent-warn`, `background: transparent` — secondary style that requires intentionality
- Support section: Ko-fi link styled as a subtle card, not a raw link
- Version: small caption at very bottom, `--text-secondary`

### 4d. Edit Entry Modal

**Current:** Two datetime inputs with Save/Cancel buttons.

**Redesigned:**
- Descriptive intro sentence: `"Adjust the start and end times for this entry."` in secondary text
- Inputs styled with `--bg-elevated` background, `1px solid --border`, `border-radius: 10px`, `padding: 12px 14px`, clear label above each
- Button row: `"Save Changes"` (primary, `--accent`) and `"Cancel"` (ghost, `--text-secondary`) side by side, equal width
- Validation error: inline red helper text below the relevant field, not an alert dialog

### 4e. Delete Confirmation Modal

**Current:** Text + Yes/No buttons.

**Redesigned:**
- Replace full modal with an **inline confirmation** that replaces the three-dot menu:
  - Three-dot menu transforms into `"Delete · Undo"` row with `200ms` transition
  - If "Delete" pressed: entry fades out and is removed
  - If "Undo" pressed or 3 seconds pass with no action: reverts to normal
  - This eliminates an entire modal layer and feels significantly more native

---

## 5. Navigation & Information Architecture

### Current IA Issues

- History and Settings are equal-weight icon buttons — no visual hierarchy suggests which is more commonly accessed
- The "forgot to start" manual entry is a small text link easily missed

### Redesigned IA

- **History** button given slight visual priority (filled icon background vs. ghost Settings icon) since users access it more frequently
- **Manual start** becomes a persistent small link with a `Clock` icon: `"Set start time"` — always visible below the action button at all states (not just during fasting), with appropriate disabled styling when not fasting
- Protocol chip doubles as a shortcut into Settings, reducing the need to find the Settings button

---

## 6. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| `< 480px` (mobile) | Full-width layout, modals as bottom sheets, summary cards stack vertically, ring sized to `min(280px, 72vw)` |
| `480px – 768px` (large mobile / small tablet) | Ring `300px`, summary cards in horizontal scroll row |
| `768px+` (tablet / desktop) | Max-width container `480px` centered, full summary strip visible, modals centered |

The app remains mobile-first. Desktop is a centered narrow column — no multi-column layout since this is an intimate, personal tool.

---

## 7. Micro-Interactions & Animation Principles

All animations follow three rules:
1. **Purposeful** — only animate state changes that benefit from visual continuity
2. **Fast** — UI responses ≤ `200ms`. Content reveals ≤ `350ms`. Never animate something the user is waiting for.
3. **Physically grounded** — use `ease-out` for elements entering (decelerating into place), `ease-in` for elements leaving, `cubic-bezier(0.32, 0.72, 0, 1)` for sheet-style reveals

| Interaction | Animation |
|---|---|
| Start Fast button press | Scale `1 → 0.97 → 1`, `100ms` |
| Fasting session begins | Ring stroke animates from 0, hero glow fades in, `300ms` |
| Goal reached | Ring glow intensifies (`400ms ease-out`), toast slides up |
| History entry delete | Row fades + collapses height, `250ms ease-in` |
| Modal open (desktop) | Fade + scale `0.96 → 1.0`, `200ms ease-out` |
| Modal open (mobile) | Slide up from bottom, `300ms cubic-bezier(0.32,0.72,0,1)` |
| Streak badge appear | Fade + slide down `8px → 0`, `300ms ease-out` |

---

## 8. Accessibility Requirements

- **Color contrast:** All text/background pairs meet WCAG AA minimum (4.5:1 for body, 3:1 for large text). The redesigned palette passes at both ratios — verify with a contrast checker during implementation.
- **Focus rings:** Visible `2px solid --accent` outline on all interactive elements, offset `2px`. Never `outline: none` without a visible replacement.
- **Touch targets:** All interactive elements minimum `44px × 44px` tap area, even if visually smaller (use padding or pseudo-elements).
- **Screen reader:** All icon-only buttons have `aria-label`. Modal `role="dialog"` with `aria-labelledby` pointing to the modal's heading. Toast uses `role="status"` and `aria-live="polite"`.
- **Reduced motion:** Wrap all animations in `@media (prefers-reduced-motion: reduce)` — replace with instant state changes.
- **Keyboard navigation:** Tab order follows visual reading order. Modals trap focus while open and return focus to the trigger element on close.

---

## 9. Light / Dark Mode

Implement via CSS custom properties on `:root` (light) and `.dark` or `prefers-color-scheme: dark`. The color token table in Section 2 defines both values.

- On first load: respect `prefers-color-scheme` system setting
- Persist user's override in localStorage under key `"fasting_app_theme"` — a separate key that does not touch `fasting_app_data`
- Add a theme toggle icon button (sun/moon) to the header right side, between History and Settings

---

## 10. Implementation Sequence

The following order minimizes risk of regressions. Each step is independently testable.

### Phase 1 — Foundation (no visual changes yet)
1. Add Google Fonts (`DM Serif Display`, `DM Sans`) via `<link>` in `index.html`
2. Define all CSS custom property tokens in `index.css` under `:root` and `.dark`
3. Wire up `prefers-color-scheme` detection and localStorage persistence for theme
4. Add theme toggle button to header (functional, uses Lucide `Sun`/`Moon` icons)

### Phase 2 — Typography & Color
5. Replace all hardcoded Tailwind color classes with token-based equivalents across `App.jsx`
6. Apply `DM Sans` as base font-family globally
7. Apply `DM Serif Display` to timer display and modal headings
8. Verify WCAG contrast ratios in both modes

### Phase 3 — Layout & Spacing
9. Redesign header: icon-only nav buttons, refined spacing, drop-shadow border
10. Refactor hero zone: pill protocol chip, ring enhancements, repositioned streak badge
11. Redesign action button: pill shape, new copy, hover/active states
12. Add summary strip with computed stats from existing history data
13. Refactor footer: two-column layout with version right-aligned

### Phase 4 — Modals
14. Implement unified modal container (bottom sheet mobile, centered desktop) with shared animation
15. Redesign History modal: card-based entries, three-dot action menu
16. Redesign Settings modal: segmented protocol control, restyles danger zone and support card
17. Redesign Edit Entry modal: styled inputs, inline validation errors
18. Implement inline delete confirmation (replacing delete confirmation modal)

### Phase 5 — Polish
19. Implement goal-reached toast notification (replaces bouncing alert)
20. Implement ring glow pulse animation during active fasting
21. Add all micro-interactions per Section 7 table
22. Add `prefers-reduced-motion` media query wrappers
23. Audit all focus rings and touch target sizes
24. Full keyboard navigation and screen reader pass

### Phase 6 — QA
25. Cross-browser test: Chrome, Firefox, Safari (iOS), Edge
26. Test on real mobile devices (iOS Safari, Android Chrome)
27. Verify localStorage data integrity — no schema changes introduced
28. Accessibility audit with browser devtools accessibility tree

---

## 11. What Is Explicitly Not Changing

To maintain seamless continuity for existing users:

- The `fasting_app_data` localStorage key and its schema (`history`, `selectedMode`, `isFasting`, `startTime`) — **untouched**
- All fasting logic: start/stop, streak calculation, goal detection, history management
- All modal trigger points and state transitions
- Fasting protocol presets and their hour values
- The Vercel Analytics integration
- The Ko-fi support link
- The footer attribution to The Helpful Dev

---

*Plan authored for: Fasting Tracker v1.1.0 — Redesign target v2.0.0*
