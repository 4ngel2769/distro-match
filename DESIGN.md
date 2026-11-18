---
name: LinuxMatch
description: A field guide to Linux distributions — precise, paper-like, and quietly authoritative.
colors:
  paper: "#F6F5F0"
  paper-surface: "#FFFFFF"
  graphite: "#0D0F0C"
  graphite-surface: "#14170F"
  ink: "#15180F"
  ink-soft: "#50564A"
  ink-faint: "#6E7568"
  ink-dark: "#F1F3EA"
  ink-dark-soft: "#AFB6A5"
  rule-light: "#D8DBD0"
  rule-dark: "#2B3126"
  lime: "#A0F002"
  lime-ink: "#3E5B08"
  lime-wash-light: "rgba(160, 240, 2, 0.16)"
  lime-wash-dark: "rgba(160, 240, 2, 0.13)"
typography:
  display:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 2.8rem)"
    fontWeight: 700
    lineHeight: 1.13
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.7rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.06em"
rounded:
  sm: "2px"
spacing:
  sm: "4px"
  md: "8px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
  plate-caption:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  swipe-card:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "24px"
---

# Design System: LinuxMatch

## Overview

**Creative North Star: "The Modern Field Guide"**

LinuxMatch reads like a well-labelled specimen drawer: a working tool whose visual language comes from field guides, catalogue plates and annotation marks rather than from the terminal or the marketing landing page. The page stays calm and paper-like; meaning is carried by hairline rules, alignment and tabular metadata, not by ornament.

The system is deliberately restrained. Lime `#A0F002` is annotation ink — it marks the active state, the primary action and the one piece of emphasis that matters. It never becomes a background wash, a glow or a gradient. Screenshots are full, honest plates with caption strips; typography is a workhorse UI face paired with a precise data face; motion is one authored entrance plus short state transitions.

**Key Characteristics:**
- Paper grounds in light mode, graphite grounds in dark mode, both with the same roles and contrast targets.
- Hairline rules, tabular metadata and generous annotation margins.
- One saturated accent with a strict action/selection job.
- No gradients, glow, emoji icons, hard offset shadows or decorative kickers.

## Colors

The palette is neutral paper/graphite with a single lime signal. Semantic green/amber/red are muted and reserved for actual status.

### Primary
- **Annotation Lime** (#A0F002): active nav, selected option, primary button hover, progress, tier emphasis. Used sparingly.
- **Deep Lime Ink** (#3E5B08): readable accent text on light paper.

### Neutral
- **Paper** (#F6F5F0) / **Paper Surface** (#FFFFFF): light-mode ground and raised specimen surfaces.
- **Graphite** (#0D0F0C) / **Graphite Surface** (#14170F): dark-mode equivalents.
- **Ink** (#15180F) / **Ink Soft** (#50564A) / **Ink Faint** (#6E7568): light-mode text hierarchy.
- **Ink Dark** (#F1F3EA) / **Ink Dark Soft** (#AFB6A5): dark-mode text hierarchy.
- **Rule Light** (#D8DBD0) / **Rule Dark** (#2B3126): hairline borders and dividers.

### Named Rules
**The Annotation Rule.** Lime marks a decision or an action. If it is decorating a static surface, remove it.

**The Plate Rule.** A distro screenshot is a specimen plate: show it whole, caption it, never crop it to pretend it is something else.

## Typography

**Display/Body Font:** Public Sans (system fallback)
**Data/Label Font:** Geist Mono (monospace fallback)

Public Sans carries reading and actions with neutral confidence; Geist Mono is reserved for ranks, versions, measurements and field labels. Monospace is never used as a "technical" costume for ordinary prose.

### Hierarchy
- **Display** (700, clamp(2rem, 4vw, 2.8rem), 1.13): welcome promise and page titles.
- **Title** (700, 1.75rem, 1.25): question and section titles.
- **Body** (400, 1rem, 1.55): all reading copy, capped at ~68–75ch.
- **Label** (500, 0.7rem, 1.4, tracked): field labels, ranks and tabular values; `font-variant-numeric: tabular-nums`.

## Layout

Maximum container 1220px; main content padding 40px 24px 88px on desktop, 24px 16px 64px on mobile. Sticky slim header with wordmark, three destinations and theme switch. Directory uses a three-column specimen grid (`minmax(300px, 1fr)`) collapsing to one column on narrow screens. Detail pages use a 1.6fr / 1fr main/side split that collapses at 860px. Breakpoints: 720px and 560px for chrome and grid adjustments.

## Elevation & Depth

Depth comes from hairline borders and soft ambient shadows (`0 1px 2px` plus `0 14px 34px` at low alpha). No hard offset block shadows, no glow. Dark-mode shadows are deeper and more diffuse.

## Shapes

Corners are 2px. Rectangles and hairline rules dominate. Markers are precise squares; icons are a single 1.6px stroke SVG set. No pills, no glass panels, no decorative gradient fills.

## Components

- **Primary button** — ink ground, paper text; hover becomes lime with ink text and lifts 1px.
- **Secondary button** — transparent with hairline/strong border; hover tints the surface.
- **Specimen card** — full screenshot plate, bottom-up scrim, caption strip, compact spec table, hairline footer.
- **Field sheet** — tabular rows of specimen metadata with a mono caption strip.
- **Mode switch** — Newcomer / Expert segmented control; active segment marked by a 2px lime inset rule.
- **Option row** — generous selectable row, square marker, selected state = lime wash + inset lime rule.
- **Score anatomy** — ranked table with aligned mono rank, weight and score plus a hairline bar.
- **Swipe deck** — full screenshot plate with two fanned preview cards, a mono caption strip, trait signals drawn from real catalogue fields, and restrained pass/like controls. Drag, buttons and arrow keys are equivalent; reduced motion removes the fly-out. Liked distros lead the result shortlist.

## Do's and Don'ts

- Do use real catalogue data and verified media; do not invent claims or testimonials.
- Do keep small text in Public Sans, and numbers/codes in Geist Mono.
- Do keep both themes at 4.5:1 body contrast and respect `prefers-reduced-motion`.
- Don't add gradients, neon glow, emoji icons, rounded-card filler or decorative eyebrow labels.
- Don't animate layout properties; use transform/opacity for the single authored entrance.
