---
name: premium-ui-design
description: Build premium UI motion graphics designs with cinematic effects, 3D interactive themes, and top-tier frameworks for any app. Prefer 21st.dev crafted components, shadcn, Aceternity, Magic UI. Use only premium colors, layouts, visual charts. Never use AI-generated themes, fonts, or generic designs. Trigger on UI design, app building, motion graphics, cinematic UI, 3D themes, premium interfaces, dashboards, landing pages.
---

# Premium UI Design

## Overview

Specialize in crafting high-end, production-ready UI and motion graphics for any application. Enforce cinematic quality, real design-engineer standards, and exclusive use of premium resources. Reject generic or AI-slop aesthetics.

## Core Rules

- Always prioritize components and patterns from 21st.dev (https://21st.dev/), shadcn/ui, Aceternity UI, Magic UI, or equivalent craft-built libraries. Copy or adapt real code rather than inventing from scratch.
- Stacks must use top frameworks only: Next.js / React, Tailwind CSS, Framer Motion (or Motion), React Three Fiber + drei for 3D, GSAP for complex timelines when needed, Recharts / Tremor / visx for charts.
- Never invent or default to AI-generated themes, fonts, color schemes, or layouts. Select from proven premium systems.
- Typography: Prefer system fonts or high-quality variable fonts already in the project (or Inter only if already present). Avoid overused free Google fonts that scream "AI generated". Use display fonts sparingly with tight tracking for headlines.
- Colors: Build on monochrome / high-contrast foundations (near-black #0A0A0A or #010102, pure white, zinc/slate grays) + one strong accent. Preferred accents include Linear lavender (#5E6AD2), Stripe indigo, Vercel-style blues, or metallic gold for luxury. Use OKLCH where possible. Reference paletteui.xyz or Linear/Stripe/Vercel design systems.
- Layouts: Generous whitespace (double the "enough" spacing), high contrast, bento grids, glass effects only when purposeful, layered depth with subtle borders/hairlines instead of heavy shadows. Mobile-first, responsive, accessible.
- Motion: Cinematic and performant. Prefer transform + opacity. Use spring physics (bounce ≤ 0.2) for UI, ease-out for entrances. Follow the detailed spring configs, durations, stagger patterns, and reduced-motion rules in references/motion-guidelines.md. Avoid layout-thrashing properties.
- 3D & Interactive: Use React Three Fiber for interactive 3D scenes, shaders, or product showcases. Keep scenes optimized (instancing, LOD, dispose on unmount). Combine with Framer Motion for hybrid 2D/3D transitions.
- Charts & Data Viz: Use premium libraries (Tremor, Recharts with custom themes, or Chart.js with polished configs). Match the app's color system. Prefer clean, high-contrast, interactive charts over decorative ones.
- Content: Prefer real, high-quality imagery, icons (Lucide, Phosphor, or custom), and microcopy. Avoid placeholder AI stock that looks synthetic.

## Workflow

1. Clarify the app type, target aesthetic (SaaS dark, luxury, consumer, etc.), and key screens.
2. Select a premium color system and type scale first. Document tokens.
3. Source or adapt components from 21st.dev / shadcn registries rather than generating new ones.
4. Layer motion and 3D only where they enhance usability or delight — never decorate for its own sake.
5. Ensure performance: GPU-friendly animations, reduced motion support, Core Web Vitals awareness.
6. Output production-ready code with clear file structure, Tailwind classes or CSS variables, and comments only for non-obvious decisions.

## References

- See references/premium-palettes.md for curated color tokens.
- See references/motion-guidelines.md for full spring configs, durations, stagger patterns, 3D motion, performance checklist, and reduced-motion rules.
- See references/frameworks.md for preferred libraries and install patterns.

## Anti-patterns (never do)

- Generic Inter + blue gradients + rounded cards with soft shadows everywhere.
- AI-default color schemes or random pastel themes.
- Over-animated interfaces that feel toy-like or slow.
- Pure black (#000) backgrounds or pure white without nuance.
- Inventing complex components when 21st.dev or shadcn already provides them.
