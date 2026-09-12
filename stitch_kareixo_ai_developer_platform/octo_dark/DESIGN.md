---
name: Octo Dark
colors:
  surface: '#10141a'
  surface-dim: '#10141a'
  surface-bright: '#353940'
  surface-container-lowest: '#0a0e14'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2eb'
  on-surface-variant: '#becaba'
  inverse-surface: '#dfe2eb'
  inverse-on-surface: '#2d3137'
  outline: '#899485'
  outline-variant: '#3f4a3d'
  surface-tint: '#7bdb80'
  primary: '#7bdb80'
  on-primary: '#00390e'
  primary-container: '#238636'
  on-primary-container: '#f9fff3'
  inverse-primary: '#006e23'
  secondary: '#a2c9ff'
  on-secondary: '#00315c'
  secondary-container: '#0071c7'
  on-secondary-container: '#f0f4ff'
  tertiary: '#d3bbff'
  on-tertiary: '#3f008d'
  tertiary-container: '#8957e5'
  on-tertiary-container: '#fffdff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#97f999'
  primary-fixed-dim: '#7bdb80'
  on-primary-fixed: '#002106'
  on-primary-fixed-variant: '#005319'
  secondary-fixed: '#d3e4ff'
  secondary-fixed-dim: '#a2c9ff'
  on-secondary-fixed: '#001c38'
  on-secondary-fixed-variant: '#004882'
  tertiary-fixed: '#ebddff'
  tertiary-fixed-dim: '#d3bbff'
  on-tertiary-fixed: '#250059'
  on-tertiary-fixed-variant: '#591db3'
  background: '#10141a'
  on-background: '#dfe2eb'
  surface-variant: '#31353c'
  canvas-default: '#0d1117'
  canvas-subtle: '#161b22'
  canvas-inset: '#010409'
  border-default: '#30363d'
  border-muted: '#21262d'
  fg-default: '#f0f6fc'
  fg-muted: '#8b949e'
  fg-subtle: '#6e7681'
  accent-green-emphasis: '#238636'
  accent-green-hover: '#2ea043'
  accent-blue: '#58a6ff'
  accent-purple: '#8957e5'
  accent-purple-light: '#a371f7'
  accent-amber: '#d29922'
  accent-red: '#f85149'
  diff-addition-line: rgba(46, 160, 67, 0.15)
  diff-addition-text: '#3fb950'
  diff-deletion-line: rgba(248, 81, 73, 0.15)
  diff-deletion-text: '#f85149'
typography:
  headline-hero:
    fontFamily: Noto Sans
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
  headline-hero-mobile:
    fontFamily: Noto Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-section:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-section-mobile:
    fontFamily: Noto Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-card:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  title-card-sm:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-base:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 21px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  code-diff:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 20px
  code-gutter:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 20px
  badge-mono:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
  label-ui:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system draws direct inspiration from the technical rigor, clarity, and ergonomics of GitHub's dark mode aesthetic. Engineered for high-density developer interfaces, source control workflows, and cloud diagnostics, the system balances utility and developer comfort during prolonged sessions.

### Design Movement & Sensibility
- **Developer Utilitarianism:** Rooted in clean boundaries, high legibility, and information density. Every pixel is dedicated to content hierarchy, code review workflows, and operational state.
- **Tonal Contrast Hierarchy:** Deep canvas foundations (`#0d1117` and `#010409`) paired with subtle slate surface layers (`#161b22`, `#21262d`) eliminate eye strain while maintaining distinction between navigation, sidebars, and active code buffers.
- **Crisp Structural Outlines:** Replaces drop shadows with disciplined 1px hairline borders (`#30363d`), giving the interface an architectural, precision-tooled feel.
- **Semantic Color Coding:** Vibrant accents are strictly reserved for states: Primer green for primary execution and verified checks, blue for hyperlinks and navigation focus, purple for PRs and merged branches, amber for alerts, and crimson for failures.

### Emotional Target
The user experience evokes the steady confidence, responsiveness, and familiarity of an enterprise-grade terminal and developer console—purposeful, distraction-free, and calibrated for speed.

## Colors

The color palette implements GitHub's Dark Default model. Monochromatic zinc-slate layers construct depth, while calibrated semantic hues signal state and system operations.

### Canvas & Surface Hierarchy
- **Canvas Base (`#0d1117`):** The foundational dark viewport background for code files, dashboards, and repository views.
- **Canvas Inset (`#010409`):** Deeper dark background used for recessed elements such as code diff gutters, terminal consoles, and search inputs.
- **Surface Level 1 (`#161b22`):** Primary card surfaces, issue containers, and header panels.
- **Surface Level 2 (`#21262d`):** Secondary controls, table headers, hover highlights, and nested toolbars.
- **Surface Level 3 (`#30363d`):** Elevated chips, input borders, and active control backgrounds.

### Typographic Contrast
- **`fg-default` (`#f0f6fc`):** High-contrast primary text, headings, and active tokens.
- **`fg-muted` (`#8b949e`):** Secondary meta-information, file paths, issue timestamps, and commit authors.
- **`fg-subtle` (`#6e7681`):** Tertiary information, placeholder text, line numbers, and keyboard shortcuts.

### Functional Accents
- **Action & Verified Green (`#238636` / `#2ea043`):** Primary call-to-action buttons ("Merge Pull Request", "Create Issue"), successful test passes, and addition diffs.
- **Interactive Blue (`#58a6ff`):** Interactive anchor tags, breadcrumb paths, active navigation tab indicators, and branch selections.
- **Pull Request Purple (`#8957e5` / `#a371f7`):** Merged branches, semantic bot annotations, and release tagging.
- **Warning Amber (`#d29922`):** Unverified commits, security advisories, and pending CI pipelines.
- **Error Red (`#f85149`):** Breaking builds, rejected approvals, and deletion lines.

## Typography

The type system prioritizes legibility, density, and monospace alignment across technical viewports.

### System Type Stack
- **Interface & Prose:** Powered by `Noto Sans` (with system fallbacks: `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Helvetica`, `Arial`). It delivers neutral legibility for markdown commentary, pull request descriptions, and general UI copy.
- **Code & Telemetry:** Standardized on `JetBrains Mono` (with system fallbacks: `ui-monospace`, `SFMono-Regular`, `SF Mono`, `Menlo`, `Consolas`). Applied to all source views, SHAs, commit messages, diff blocks, and metadata tags.

### Sizing and Line Height Precision
The default body type operates on a compact 14px size with a 21px line height (1.5x ratio) for optimal content density. Code viewers lock both line text (`code-diff`) and line numbering (`code-gutter`) to a shared 20px line height, guaranteeing baseline parity between split diff views and side-by-side gutter widgets.

## Layout & Spacing

The layout model adheres to an 8px architectural grid (with 4px half-step sub-rhythms) designed to sustain high density without visual crowding.

### Screen Layout & Breakpoints
- **Desktop (1012px+):** Fixed repository/sidebar configurations utilizing a 12-column grid or split workspace. Maximum container width caps at `1280px` for standard views, switching to 100% fluid width for code diffs and continuous log terminals. Outer page margins are `2rem` (32px), with `1rem` (16px) gutters.
- **Tablet (768px – 1011px):** Collapsible panels convert to off-canvas sheets or accordion lists. Outer margins reduce to `1.5rem` (24px).
- **Mobile (<768px):** Single-column stacked stream. Repository sidebars fold into top-level horizontal navigation strips or overlay drawers. Split diff viewers collapse to unified inline diff viewports with `1rem` (16px) margins.

### Component Spacing Rhythm
- `space-xs` (4px): Used for micro-separators, icon-to-label gaps, and pill badge padding.
- `space-sm` (8px): Standard gap between list items, toolbar actions, and form field stacks.
- `space-md` (16px): Card internal padding, container headers, and section groupings.
- `space-lg` (24px): Separation between distinct modules, table containers, and tab groups.
- `space-xl` (32px): Major page division headers and hero margins.

## Elevation & Depth

Visual hierarchy eschews heavy, blurry shadows in favor of structural tonal layering and crisp 1px borders inspired by GitHub Primer.

### Surface Tiers & Hairline Dividers
1. **Underlay Canvas (`#010409`):** Recessed wells, terminal panes, and code line-number gutters.
2. **Base Canvas (`#0d1117`):** Viewport ground where main content streams flow.
3. **Card & Box Containers (`#161b22`):** Primary containers bounded by `1px solid #30363d`. No drop shadow.
4. **Active/Interactive Surface (`#21262d`):** Nested toolbars, file explorer list items on hover, and active segment tabs.
5. **Overlays & Dialogs (`#161b22`):** Command palettes, branch selector dropdowns, and commit modals. They feature a `1px solid #30363d` frame coupled with a focused drop shadow: `0 8px 24px rgba(1, 4, 9, 0.75)`.

## Shapes

The design system uses a crisp, restrained corner radius pattern (`roundedness: 1`), standardizing on 6px (`rounded-md`) for controls and cards to maintain a structured technical feel.

### Corner Radius System
- **Controls & Inputs (`6px` / `0.375rem`):** Buttons, text fields, search bars, and dropdown triggers.
- **Cards & Outer Containers (`6px` / `0.375rem`):** Code boxes, issue cards, timeline blocks, and table envelopes.
- **Nested Inner Items (`4px` / `0.25rem`):** Internal list items, menu selections, and code snippet callouts.
- **Pill Badges & Counters (`9999px`):** Reserved strictly for metadata tags, branch labels, commit status chips, and issue counters. Buttons and text boxes must never use full pill rounding.

## Components

### Buttons
- **Primary Button:** Background `#238636`, border `1px solid rgba(240, 246, 252, 0.1)`, text `#ffffff`. Hover state transitions to `#2ea043`. Active state shifts to `#238636` with inset shadow `inset 0 1px 0 rgba(0, 45, 17, 0.2)`. Border radius is 6px; typography is 14px semi-bold.
- **Default / Secondary Button:** Background `#21262d`, border `1px solid #30363d`, text `#c9d1d9`. On hover, background shifts to `#30363d` with text `#f0f6fc`.
- **Invisible / Ghost Button:** Transparent background, text `#58a6ff` or `#8b949e`. Hover triggers `#21262d` background.
- **Danger Button:** Background `#21262d`, border `1px solid #30363d`, text `#f85149`. Hover changes background to `#da3633`, border to `#f85149`, text to `#ffffff`.

### Badges & Pill Counters
- **Counter Pill:** Height 20px, radius 9999px, padding `0 6px`, font `Noto Sans` 12px weight 500, background `rgba(110, 118, 129, 0.4)`, text `#f0f6fc`.
- **Status Badges (Pills):** Height 22px, radius 9999px, padding `0 10px`, font `JetBrains Mono` 11px uppercase weight 500.
  - **Open Issue / Verified Pass:** Background `rgba(35, 134, 54, 0.15)`, border `1px solid rgba(46, 160, 67, 0.4)`, text `#3fb950`.
  - **Merged PR:** Background `rgba(137, 87, 229, 0.15)`, border `1px solid rgba(163, 113, 247, 0.4)`, text `#a371f7`.
  - **Warning / Alert:** Background `rgba(210, 153, 34, 0.15)`, border `1px solid rgba(210, 153, 34, 0.4)`, text `#d29922`.
  - **Closed / Failed:** Background `rgba(248, 81, 73, 0.15)`, border `1px solid rgba(248, 81, 73, 0.4)`, text `#f85149`.

### Code Diff & File Viewer
- **Container:** Background `#0d1117`, border `1px solid #30363d`, border radius 6px.
- **Header:** Background `#161b22`, border-bottom `1px solid #30363d`, padding `8px 16px`. Contains filename in `Noto Sans` 14px bold, commit SHA chip, and delta counters.
- **Gutter Column:** Background `#010409`, border-right `1px solid #21262d`, text `#6e7681`, width 48px, monospace 12px.
- **Diff Additions:** Background `rgba(46, 160, 67, 0.15)`, gutter green accent `#3fb950`, text `#f0f6fc`.
- **Diff Deletions:** Background `rgba(248, 81, 73, 0.15)`, gutter red accent `#f85149`, text `#f0f6fc`.

### Form Fields & Inputs
- **Text Inputs:** Background `#010409`, border `1px solid #30363d`, border radius 6px, text `#f0f6fc`, placeholder `#6e7681`, padding `5px 12px`, font size 14px. Focus state triggers border `#58a6ff` and an outline ring `0 0 0 3px rgba(88, 166, 255, 0.3)`.
- **Search Bar:** Preceded by a 16px search icon in `#8b949e`, with keyboard shortcut badge (`/` or `Cmd+K`) right-aligned in `1px solid #30363d` and background `#161b22`.

### Checkboxes & Radios
- **Checkboxes:** Size 16x16px, border radius 4px, background `#0d1117`, border `1px solid #30363d`. Selected state fills with `#1f6feb`, border `#1f6feb`, and a white check icon. Focus introduces a 2px offset ring in `#58a6ff`.

### Tables & List Groups
- **Table Container:** Outer border `1px solid #30363d`, border radius 6px, background `#161b22`.
- **Header Row:** Background `#161b22`, border-bottom `1px solid #21262d`, text `#8b949e`, padding `12px 16px`.
- **Data Rows:** Background `#0d1117`, border-bottom `1px solid #21262d`, text `#f0f6fc`, padding `12px 16px`. Row hover shifts background to `#161b22`.

### Navigation & Segmented Tabs
- **Tabs (Underline Nav):** Horizontal row with no background. Active tab has a bottom 2px indicator in `#f78166` (or `#58a6ff` for code tabs) with primary text `#f0f6fc` and bold weight. Inactive tabs display `#8b949e` and turn `#f0f6fc` on hover.