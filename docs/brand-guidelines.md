# HealthSync — Brand Guidelines (Aurora Health)

> Last updated: 2026-07-20
> Status: Active
> Design system: "Aurora Health" — calm, premium, real-time 3D healthcare.

## Quick Reference

| Element | Value |
|---------|-------|
| Primary Accent | #22D3EE (Aurora Cyan) |
| Secondary Accent | #2DD4BF (Teal) |
| Tertiary Accent | #6366F1 → #8B5CF6 (Indigo → Violet) |
| Primary Font | Sora (display + headings) |
| Body Font | Manrope |
| Voice | Calm, premium, trustworthy, clear |

---

## 1. Color Palette

### Brand / Aura Accents

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Aurora Cyan | #22D3EE | rgb(34,211,238) | Primary CTAs, links, hero glow |
| Teal | #2DD4BF | rgb(45,212,191) | Secondary CTAs, success-adjacent |
| Indigo | #6366F1 | rgb(99,102,241) | Depth, violet transitions |
| Violet | #8B5CF6 | rgb(139,92,246) | Accent gradients, sparkles |
| Ink | #070B16 | rgb(7,11,22) | Dark-mode base |

### Neutral Palette (semantic, via CSS vars)

| Name | Light | Dark |
|------|-------|------|
| Background | #EEF2F9 | #070B16 |
| Surface / Card | #FFFFFF | #0E1626 |
| Foreground | #0F172A | #F1F5F9 |
| Muted text | #475569 | #94A3B8 |
| Border | #D1D9E6 | #1E2D4A |

### Semantic States

| State | Hex | Usage |
|-------|-----|-------|
| Success | #22C55E | Confirmations |
| Warning | #F59E0B | Pending / cautions |
| Error | #EF4444 | Errors, destructive |
| Info | #0EA5E9 | Informational |

### Accessibility

- Body text on background: ≥ 4.5:1 contrast (WCAG 2.1 AA).
- All interactive elements keep a visible focus ring (`--ring` / brand cyan).
- Never convey state by color alone — pair with icon or label.

---

## 2. Typography

### Font Stack

```css
--font-head: 'Sora', 'Plus Jakarta Sans', system-ui, sans-serif;
--font-body: 'Manrope', system-ui, sans-serif;
```

> Note: Inter / Plus Jakarta Sans are intentionally NOT used as the base face —
> they are overused across AI-generated UIs and read as generic. Sora + Manrope
> give HealthSync a distinctive, precise, "medical-tech" personality.

### Type Scale

| Element | Desktop | Mobile | Weight |
|---------|---------|--------|--------|
| H1 | 60px | 36px | 800 |
| H2 | 40px | 28px | 700 |
| H3 | 28px | 24px | 700 |
| Body | 16px | 16px | 400 |
| Body LG | 18px | 18px | 400 |
| Small | 14px | 14px | 400 |

---

## 3. Logo Usage

### Variants

| Variant | File | Use |
|---------|------|-----|
| Favicon / Icon | `public/favicon.svg` | Tabs, app icon |
| Full Wordmark | `public/logo.svg` | Headers, documents |

### Clear Space & Minimum Size

- Minimum clear space = height of the logo mark.
- Digital icon minimum: 24px. Full logo minimum: 120px.

### Don'ts

- Don't rotate, skew, or recolor outside the approved gradient.
- Don't add drop shadows or effects to the mark.
- Don't place on busy backgrounds without the glass card behind it.

---

## 4. Voice & Tone

| Trait | We Are | We Are Not |
|-------|--------|------------|
| Calm | Reassuring, steady | Alarmist |
| Premium | Refined, considered | Flashy, gimmicky |
| Trustworthy | Plain-spoken, honest | Over-promising |
| Clear | Direct, jargon-free | Vague |

### Prohibited Terms

| Avoid | Use Instead |
|-------|-------------|
| Seamless | Smooth, connected |
| Revolutionary | New, improved |
| Leverage | Use |
| Synergy | Coordination |

---

## 5. Imagery & 3D

- **3D language:** React Three Fiber + Drei. Luminous distorting "health orb",
  drifting molecule fields, slow DNA helices, sparkle motes.
- **Mood:** Deep midnight base, soft aurora glow, glass surfaces. Calm, clinical, premium.
- **Motion:** GSAP for orchestrated entrances; respect `prefers-reduced-motion`.
- **Icons:** Lucide React, 24px grid, 1.5–2px stroke, rounded joins. No emojis.

---

## 6. Design Components

| Component | Token |
|-----------|-------|
| Primary Button | `bg-gradient-to-br from-brand-cyan to-brand-teal text-white shadow-glow` |
| Glass Surface | `.glass` / `.glass-strong` utility |
| Card Radius | 1.5rem (rounded-2xl) |
| Button Radius | 0.75rem (rounded-xl) |
| Pills / Tags | full (rounded-full) |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-20 | Aurora Health identity — 3D premium system, Sora/Manrope type, cyan/teal/indigo aura. |
