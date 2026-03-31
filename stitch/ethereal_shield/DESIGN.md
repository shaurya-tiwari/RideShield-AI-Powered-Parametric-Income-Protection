# Design System Specification: The Quiet Intelligence

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Concierge"**

This design system is built to evoke the feeling of a high-end, bespoke insurance experience that operates with quiet precision. Unlike traditional insurtech, which often relies on aggressive "disruptor" aesthetics or cold, data-heavy grids, this system prioritizes **calm, automated trust**. 

To move beyond the "template" look, we leverage an **Editorial Layout Strategy**. This means treating the screen like a premium broadsheet or a gallery catalog: generous margins (using the `20` and `24` spacing tokens), purposeful asymmetry (e.g., left-aligned headers with right-aligned content blocks), and a rejection of the boxy, "containerized" web. We don't trap content; we let it breathe.

---

## 2. Colors & Tonal Depth
Our palette transitions away from the stark white of "SaaS" and into a warm, stone-inspired sanctuary.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections.
Boundaries must be defined solely through background color shifts. 
- A hero section using `surface` (`#fafaf5`) transitions into a feature section using `surface_container_low` (`#f4f4ef`). 
- This creates a sophisticated, "soft-touch" interface that feels expensive and intentional.

### Surface Hierarchy & Nesting
Treat the UI as a series of layered fine papers.
- **Base Layer:** `background` or `surface`
- **Secondary Content:** `surface_container`
- **Interactive/Raised Elements:** `surface_container_lowest` (pure white `#ffffff`) to create a "pop" against the stone background without a heavy shadow.

### Signature Textures
Main CTAs and Hero backgrounds should utilize a **Subtle Emerald Gradient**. 
- Transition from `primary` (`#003527`) to `primary_container` (`#064e3b`) at a 135-degree angle. This prevents the "flatness" of digital-first brands and adds a luxurious, velvety depth to the emerald.

---

## 3. Typography: The Editorial Voice
We use **Plus Jakarta Sans** exclusively. Its geometric clarity combined with soft terminals perfectly mirrors our "intelligent yet calm" ethos.

- **Display Scale (`display-lg` to `display-sm`):** Used for "Statement Headings." These should have a tighter letter-spacing (-0.02em) to feel like a high-end magazine header.
- **Body Scale (`body-lg`):** Our primary reading size. Ensure a line-height of 1.6 to maintain the "quiet" feel.
- **The "Data as Prose" Rule:** Since we avoid dense grids, "Data" should be presented as large, readable `headline-lg` figures paired with `label-md` descriptors in `on_surface_variant`.

---

## 4. Elevation & Depth
In this system, "Elevation" is a chromatic concept, not a structural one.

### The Layering Principle
Depth is achieved by "stacking" the surface-container tiers. 
- Place a `surface_container_lowest` card (the "Paper" layer) on a `surface_container_low` background (the "Table" layer). 
- The contrast is subtle (less than 2%), but the human eye perceives it as a high-quality tactile shift.

### Ambient Shadows
If a floating element (like a modal or a floating action button) is required:
- **Shadow Color:** Use a tinted shadow: `rgba(26, 28, 25, 0.08)` (a 8% opacity version of `on_surface`).
- **Blur:** Minimum `32px` blur with a `4px` Y-offset. This mimics natural, soft ambient light.

### Glassmorphism & Depth
For navigation bars or overlaying tooltips, use a **Frosted Glass** effect:
- **Background:** `surface` at 70% opacity.
- **Backdrop Blur:** `12px` to `20px`.
- This allows the warm stone tones to bleed through, ensuring the UI feels like a single cohesive environment rather than fragmented components.

---

## 5. Components

### Buttons
- **Primary:** Emerald Gradient (`primary` to `primary_container`). `xl` (1.5rem) roundedness. No shadow.
- **Secondary:** `surface_container_high` background with `on_primary_fixed_variant` text.
- **Tertiary:** Text-only with a `3.5` spacing horizontal padding. Transitions to a `surface_variant` background on hover.

### Cards & Lists
**Forbid the use of divider lines.** 
- Separate list items using the `3` (1rem) spacing scale.
- Use a `surface_container_low` background on hover to indicate interactivity.
- **Asymmetry:** In cards, place labels in the top-left and primary values in the bottom-right to create a dynamic, editorial flow.

### Parametric Status Chips
- Use `primary_fixed` for active "Protected" states.
- Use `tertiary_fixed` for "Alert" or "Adjustment" states.
- **Style:** Small caps `label-sm`, `full` roundedness, no border.

### Input Fields
- **Default:** `surface_container_highest` background. No border.
- **Focus:** `surface_container_lowest` background with a `2px` "Ghost Border" using `outline_variant` at 20% opacity. 
- This creates a visual "glow" rather than a harsh structural change.

---

## 6. Do's and Don'ts

### Do:
- **Use "White Space" as a Component:** Treat empty space as a structural element that guides the eye.
- **Embrace Asymmetry:** If a layout feels too "balanced" or "templated," try shifting a header 4 units to the left or right.
- **Soft Transitions:** Use `300ms ease-out` for all hover and state transitions to maintain the "calm" tone.

### Don't:
- **Don't use 100% Black:** Always use `on_surface` (#1a1c19) for text to keep the "warmth."
- **Don't use Grid Lines:** If you feel the need for a line, try using a slightly different shade of stone background instead.
- **Don't use Standard Shadows:** Never use a default `05, 05, 10, black` shadow. It destroys the high-end, editorial feel.
- **No Dense Data:** If a user needs to see "Limits" or "Coverage," use a series of staggered cards or large-type statements rather than a table.