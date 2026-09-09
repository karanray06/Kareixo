Kareixo — DESIGN.md
1. Product Overview
Product: Kareixo Category: AI-powered GitHub code review platform Website: https://kareixo.vercel.app/ Repository: https://github.com/karanray06/Kareixo
Kareixo automatically reviews GitHub pull requests using AI and provides actionable code-review feedback directly inside GitHub.
The product should feel like a premium developer tool, not a generic AI SaaS landing page.
Core product promise
Ship better code, automatically.
Kareixo should communicate:


intelligent

trustworthy

developer-first

fast

transparent

minimal

technically sophisticated

privacy-conscious

free and accessible
The redesign should preserve Kareixo's existing functionality and information architecture while significantly improving the visual design, hierarchy, usability, responsiveness, and perceived product quality.
2. Design Direction
Overall aesthetic
Create a minimal, premium, modern developer-tool aesthetic inspired by high-end products such as:


Linear

Vercel

Raycast

Arc

GitHub's modern interface

Stripe

Superhuman
Do NOT copy any of these products.
The visual language should feel original to Kareixo.
Keywords
minimal premium technical editorial calm precise high-performance developer-centric AI-native
Avoid excessive gradients, excessive glassmorphism, giant decorative illustrations, noisy backgrounds, oversized cards, and generic AI imagery.
3. Brand Personality
Kareixo should feel:
Smart
The interface should communicate intelligence without using unnecessary AI clichés.
Quietly powerful
Use whitespace and typography instead of visual noise to communicate sophistication.
Trustworthy
Security and privacy information should be visible and easy to understand.
Developer-native
Use familiar concepts such as pull requests, repositories, diffs, commits, findings, severity, review status, and GitHub integration.
Fast
Interactions should feel immediate and lightweight.
4. Visual System
Color Philosophy
Use a predominantly neutral palette.
Primary background


Main background: near-white / soft off-white

Avoid pure #FFFFFF everywhere.

Use subtle tonal differences between sections.
Suggested:
Background: #FAFAF9
Surface: #FFFFFF
Surface subtle: #F5F5F4
Border: #E7E5E4
Border strong: #D6D3D1
Primary text: #18181B
Secondary text: #71717A
Muted text: #A1A1AA

Dark mode
Support a sophisticated dark theme.
Background: #09090B
Surface: #111113
Surface elevated: #18181B
Border: #27272A
Primary text: #FAFAFA
Secondary text: #A1A1AA
Muted text: #71717A

Accent
Use one restrained Kareixo accent.
Preferred accent:
Accent: #18181B
Accent foreground: #FFFFFF

Use subtle indigo/violet only for AI-related states if necessary.
Do not make the entire interface purple.
Semantic colors
Success: #16A34A
Warning: #D97706
Error: #DC2626
Info: #2563EB

Use semantic colors sparingly.
5. Typography
Use a modern geometric/system sans-serif.
Preferred:
Inter
Geist
system-ui

If Geist is available, use Geist.
Typography hierarchy
Hero heading:


64–80px desktop

42–52px tablet

36–42px mobile

weight 600–700

tight letter spacing
Section heading:


36–48px

weight 600
Card heading:


18–22px

weight 600
Body:


15–17px

line-height 1.6
Small UI:


12–14px
Avoid excessive font weights.
6. Layout Principles
Use a centered max-width container.
Desktop max-width: 1200–1280px
Tablet max-width: 960px
Mobile: 100% with 20–24px horizontal padding

Use generous vertical spacing.
Recommended section spacing:
Desktop: 120–160px
Tablet: 90–120px
Mobile: 72–96px

Use an 8px spacing system.
4
8
12
16
24
32
40
48
64
80
96
128

Avoid tightly packed layouts.
7. Border Radius
Use restrained rounded corners.
Buttons: 8–10px
Inputs: 8–10px
Cards: 12–16px
Large panels: 16–20px

Avoid extremely rounded pill-shaped UI except for:


status badges

tags

small labels
8. Shadows
Keep shadows extremely subtle.
Preferred:
0 1px 2px rgba(0,0,0,0.04)
0 8px 30px rgba(0,0,0,0.05)

Most cards should rely on:


borders

spacing

tonal contrast
rather than large shadows.
9. Navigation
Create a premium floating/sticky navigation bar.
Desktop
Layout:
[Kareixo logo]     Product   How it works   Security   GitHub

                              [Sign in] [Install on GitHub]

The navbar should:


remain compact

have subtle backdrop blur

use a thin border

become slightly elevated on scroll

never dominate the page
Logo
Use the existing Kareixo identity where possible.
Logo treatment:


simple

monochrome

recognizable

no unnecessary glow
10. Landing Page
The landing page should be redesigned completely while preserving Kareixo's existing product messaging.
Current product content includes:


automatic GitHub PR reviews

logic-error detection

security analysis

performance analysis

code-style feedback

privacy/data handling

Gemini-powered architecture

Kareixo Chat

GitHub installation
These should remain core parts of the experience.
11. Hero Section
The hero should be the strongest part of the website.
Hero structure
Small eyebrow:
AI CODE REVIEW FOR GITHUB

Main headline:
Ship better code.
Automatically.

Supporting copy:
Kareixo reviews your pull requests with AI, catches issues before they reach production, and gives your team actionable feedback directly in GitHub.

Primary CTA:
Install on GitHub

Secondary CTA:
Explore how it works

Optional small trust statement:
Free forever · No configuration · GitHub-native

12. Hero Visual
Do NOT use a generic AI illustration.
Instead create a sophisticated developer workflow visualization.
Show a realistic pull-request review interface.
Example composition:
┌─────────────────────────────────────────────┐
│ Pull Request #284                           │
│ Add authentication middleware               │
│                                             │
│ ✓ Kareixo reviewed this pull request       │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ auth.ts                                 │ │
│ │                                         │ │
│ │ + const token = req.headers...          │ │
│ │                                         │ │
│ │ ⚠ Security                              │ │
│ │ Token should be validated before use.   │ │
│ │                                         │ │
│ │ [View suggestion]                       │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ 12 files changed · 4 findings · 2 resolved │
└─────────────────────────────────────────────┘

The visual should feel like an actual developer product.
Use:


syntax highlighting

subtle code lines

finding badges

review status

tiny metadata

clean GitHub-inspired structure
Avoid making the mockup too large or overly detailed.
13. Social Proof / Trust Strip
Immediately below hero.
Use a minimal horizontal strip:
Built for developers
GitHub-native
Privacy conscious
AI-powered
Free forever

No fake customer logos.
Do not invent statistics.
14. How It Works
Section heading:
From pull request to reviewed code.

Supporting text:
Kareixo fits directly into the workflow your team already uses.

Use three large numbered steps.
Step 01
Connect GitHub
Install the Kareixo GitHub App on your repository.
Step 02
Open a pull request
Kareixo automatically detects new and updated pull requests.
Step 03
Get actionable feedback
Receive review findings and suggested improvements directly in GitHub.
Use a horizontal timeline on desktop and vertical timeline on mobile.
15. What Kareixo Catches
Create a refined 2x2 feature grid.
Heading:
Find problems before they become production problems.

Cards:
Logic errors
Catch edge cases, incorrect conditions, async mistakes, and flawed application logic.
Icon: minimal code/branch icon.
Security flaws
Detect injection risks, unsafe input handling, secret exposure, and security-sensitive patterns.
Icon: shield.
Performance issues
Identify inefficient queries, unnecessary rendering, memory issues, and expensive operations.
Icon: activity/performance graph.
Code quality
Improve readability, consistency, maintainability, and developer experience.
Icon: spark/code icon.
Cards should be mostly white/neutral with thin borders.
On hover:


slightly translate upward

border becomes darker

subtle shadow

icon becomes accent colored
No excessive animations.
16. Review Experience
Introduce a dedicated product showcase section.
Heading:
Reviews that explain themselves.

Supporting copy:
Kareixo doesn't just flag a line of code. It explains why the issue matters and what you can do about it.

Create a large split layout.
Left:


code diff

highlighted problematic line

severity marker
Right:
Security issue

This value is used before validation.

Why it matters
Unvalidated input can reach the database layer.

Suggested fix
Validate the input before constructing the query.

[Apply suggestion]

Include:


severity

explanation

rationale

suggestion

file name

line number
This is a key differentiator.
17. Dashboard Preview
Create a premium Kareixo dashboard mockup.
Dashboard layout:
┌──────────────┬─────────────────────────────────────────┐
│ Kareixo      │ Overview                                │
│              │                                         │
│ Overview     │ 12 repositories                         │
│ Repositories │                                         │
│ Reviews      │ ┌────────┐ ┌────────┐ ┌─────────────┐ │
│ Settings     │ │ 48     │ │ 12     │ │ 3           │ │
│              │ │Reviews │ │Passed  │ │Findings     │ │
│              │ └────────┘ └────────┘ └─────────────┘ │
│              │                                         │
│              │ Recent reviews                          │
│              │ ──────────────────────────────────────  │
│              │ repository / PR / status / findings     │
└──────────────┴─────────────────────────────────────────┘

Dashboard should feel like a real SaaS application rather than a marketing mockup.
18. Transparency Section
Create a section around:
AI review without the black box.

Explain that Kareixo surfaces:


findings

rationale

severity

suggested changes

review history
Use an elegant visual showing:
Finding
↓
Why it matters
↓
Evidence
↓
Suggested fix
↓
Review history

This should reinforce trust.
19. Privacy / Security Section
Create a visually strong trust section.
Heading:
Your code stays yours.

Copy:
Kareixo is designed around privacy. Code diffs are used to generate reviews and are not retained as part of the review workflow.

Use concise supporting points:
No code storage
GitHub-native permissions
Secure webhook flow
Transparent review process

Do not use fear-based security messaging.
20. Free Forever Section
Current Kareixo positioning is strongly based around being free forever and using resilient model routing.
Create a minimalist section:
Powerful reviews.
No pricing wall.

Supporting text:
Kareixo is built to stay accessible to developers. Reviews are routed across available AI capacity with automatic failover.

Do not invent pricing tiers or usage limits.
21. Kareixo Chat
Treat Kareixo Chat as a secondary product, not the main product.
Heading:
And when you're not reviewing a PR,
just ask Kareixo.

Supporting text:
Use Kareixo Chat as a general-purpose AI assistant for development, debugging, and technical questions.

Visual:
Minimal AI chat interface.
Example:
You
Why is this query slow?

Kareixo
The query is performing an unnecessary full-table scan...

Suggested approach
1. Add an index
2. Reduce selected fields
3. Review the query plan

CTA:
Try Kareixo Chat

22. Final CTA
Use a large, quiet CTA section.
Headline:
Your next pull request
could already be better.

Supporting text:
Connect Kareixo to GitHub and let every pull request get a second pair of eyes.

Primary button:
Install on GitHub

Secondary:
View source on GitHub

The final section should have a subtle background contrast but no huge gradient.
23. Footer
Minimal footer.
Left:
Kareixo
AI code review for GitHub.

Links:
Product
How it works
Security
Kareixo Chat
Pricing
Privacy
Terms
GitHub

Bottom:
© 2026 Kareixo

Use a very clean footer with generous spacing.
24. Dashboard Design System
The authenticated dashboard is equally important.
Create a completely redesigned application shell.
Sidebar
Desktop sidebar:
Kareixo

Overview
Repositories
Reviews
────────────────
Settings
GitHub

[User avatar]
Karan Ray

Sidebar should be:


compact

monochrome

240px wide

subtle border-right

collapsible
25. Dashboard Overview
Top:
Good evening, Karan.
Here's what's happening across your repositories.

Stats:
Reviews
Findings
Repositories
Resolved

Use small cards, not oversized metric blocks.
Recent activity:
Repository
Pull request
Review status
Findings
Updated

Use table rows with clear hierarchy.
26. Repository Page
Header:
Repository name
owner/repository

Actions:
Open GitHub
Review settings

Show:


review activity

recent PRs

findings

review history

repository status
27. Review Details Page
This should be one of the most polished screens.
Layout:
← Reviews

Improve authentication flow

owner/repository #284

Passed with suggestions

──────────────────────────────────────────

4 findings
2 security
1 performance
1 code quality

──────────────────────────────────────────

Files changed

auth.ts
database.ts
middleware.ts

──────────────────────────────────────────

Finding #1

Security · High

Unsafe input validation

[code diff]

Why this matters

...

Suggested fix

...

[Open on GitHub]

Use sticky summary/navigation where appropriate.
28. Status System
Create consistent review statuses.
Passed
Green dot.
Passed

Findings
Amber/orange.
Needs attention

Critical
Red.
Critical issue

Reviewing
Blue/neutral.
Reviewing

Avoid excessive colored UI.
29. Interaction Design
Animations should be subtle.
Use:


120–200ms transitions

ease-out

slight translateY

opacity changes

button press feedback

skeleton loading
Avoid:


bouncing

excessive parallax

flashy gradients

constant motion

large animation sequences
The product should feel fast.
30. Buttons
Primary:
background: #18181B
text: #FFFFFF
height: 40–44px
padding: 0 18px
radius: 8px

Hover:
background slightly lighter/darker
transform: translateY(-1px)

Secondary:
background: transparent
border: 1px solid #E4E4E7

Buttons should have clear hierarchy.
31. Inputs
Inputs should be:


clean

compact

accessible

clearly focused
Focus state:
border: accent
subtle focus ring

Avoid oversized form controls.
32. Icons
Use a consistent modern icon library such as Lucide.
Icon style:


16–20px

1.5–2px stroke

monochrome by default
Never mix multiple icon styles.
33. Code UI
Code blocks should feel authentic.
Use:


monospace typography

subtle syntax highlighting

line numbers

file labels

diff indicators

warning/error markers
Recommended font:
JetBrains Mono
Geist Mono
SFMono-Regular

Do not use excessive syntax colors.
34. Responsive Design
Design desktop first but ensure excellent mobile behavior.
Mobile
Navigation becomes:
[Kareixo]                 [Menu]

Hero:


left aligned

36–42px headline

full-width CTA

product visualization below
Feature grids become single column.
Dashboard becomes:


collapsible sidebar

bottom navigation only if useful

horizontally scrollable tables

stacked cards
Never simply shrink desktop layouts.
35. Accessibility
Target WCAG AA.
Requirements:


sufficient text contrast

visible keyboard focus

semantic headings

accessible buttons

accessible form labels

reduced-motion support

no information communicated only by color
36. Avoid
Do NOT generate:


generic purple AI SaaS landing page

giant gradient blob

floating 3D robot

excessive glassmorphism

neon cyberpunk styling

excessive rounded cards

fake customer testimonials

fake company logos

fake usage statistics

fake developer avatars

excessive emojis

giant text covering the entire viewport

unnecessary pricing tiers

stock photography

overly decorative illustrations
Kareixo is a developer product. The interface should look like software built for serious developers.
37. Design Tokens
Use these as the foundation.
:root {
  --background: #FAFAF9;
  --surface: #FFFFFF;
  --surface-subtle: #F5F5F4;

  --text-primary: #18181B;
  --text-secondary: #71717A;
  --text-muted: #A1A1AA;

  --border: #E7E5E4;
  --border-strong: #D6D3D1;

  --accent: #18181B;
  --accent-foreground: #FFFFFF;

  --success: #16A34A;
  --warning: #D97706;
  --error: #DC2626;
  --info: #2563EB;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 8px 30px rgba(0,0,0,0.05);
}

38. Stitch Generation Instructions
When generating the design in Google Stitch:
Priority 1
Preserve Kareixo's actual product purpose and functionality.
Priority 2
Create a completely new visual identity and layout.
Priority 3
Make the product feel premium without making it visually complicated.
Priority 4
Prioritize information hierarchy and usability over decoration.
Priority 5
Make the UI realistic enough that a developer could directly implement it in Next.js + React + Tailwind CSS.
Kareixo currently uses Next.js, React, Tailwind CSS, Auth.js, Neon/Postgres, GitHub App integration, and AI provider routing, so generated UI should be implementation-friendly for this stack.
39. Screen Generation Order
Generate the following screens in this order:
Screen 01 — Landing Page
Desktop 1440px.
Sections:


Navbar

Hero

Trust strip

How it works

What Kareixo catches

Review experience

Dashboard preview

Transparency

Privacy

Free forever

Kareixo Chat

Final CTA

Footer
Screen 02 — Dashboard
Desktop 1440px.
Include:


sidebar

overview

metrics

recent reviews

repository activity
Screen 03 — Repository
Desktop 1440px.
Include:


repository header

review activity

pull requests

findings
Screen 04 — Review Details
Desktop 1440px.
Include:


PR metadata

review summary

findings

code diff

AI explanation

suggested fix
Screen 05 — Kareixo Chat
Desktop 1440px.
Include:


sidebar

conversation

model indicator

code blocks

prompt composer
Screen 06 — Mobile Landing
390px width.
Create a genuinely responsive mobile experience.
Screen 07 — Mobile Dashboard
390px width.
Prioritize:


review status

findings

recent activity

repository access
40. Final Design Goal
The final Kareixo experience should feel like:
A calm, highly polished developer tool that happens to use AI.
Not:
An AI website with developer-themed graphics.
The user should immediately understand:
Connect GitHub → Open PR → Kareixo reviews it → Fix issues → Ship confidently.
Every visual decision should reinforce that workflow.
The finished design should be:
minimal + premium + technical + trustworthy + fast + developer-native.