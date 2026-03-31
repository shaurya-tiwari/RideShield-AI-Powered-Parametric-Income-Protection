```markdown
# Design System Strategy: The Calculated Sanctuary

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"The Calculated Sanctuary."** In the high-stakes world of parametric insurance, the interface must function as an oasis of clarity and precision. We move beyond the "standard SaaS dashboard" by rejecting rigid, boxy layouts in favor of an editorial experience that feels curated and authoritative.

The system breaks the "template" look through **Intentional Asymmetry**—where data density is balanced by expansive negative space—and **Tonal Depth**, using color shifts rather than lines to define boundaries. It is a professional insurtech tool that prioritizes intelligence over decoration, and reassurance over complexity.

---

## 2. Colors & Surface Logic
The palette is rooted in warm neutrals to provide a grounded, human feel, accented by deep, authoritative tones that signal institutional trust.

### Surface Hierarchy & Nesting
To achieve a high-end feel, we employ **Tonal Layering**. Instead of using borders to separate content, we use the `surface-container` tiers to create a physical sense of depth.
*   **Base Layer:** The application background uses `surface` (#f9f9f6).
*   **Sectioning:** Use `surface-container-low` (#f4f4f1) to define major layout regions (e.g., a side panel or a secondary content area).
*   **Actionable Elements:** High-priority cards or interactive modules should sit on `surface-container-lowest` (#ffffff) to "pop" against the warmer background.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning or card containment. Boundaries must be defined solely through background color shifts. For instance, a list of insurance claims should reside within a `surface-container-highest` block sitting on a `surface-container-low` background. This creates a "soft edge" that feels integrated and premium.

### Signature Textures & Glass
*   **The Gradient Rule:** For primary CTAs or high-level status cards, use a subtle linear gradient transitioning from `primary` (#003535) to `primary-container` (#0d4d4d). This adds a "weighted" feel that flat color cannot replicate.
*   **Glassmorphism:** For floating overlays or navigation headers, use `surface-container-lowest` with a 70-80% opacity and a 12px-16px backdrop blur. This allows the sophisticated neutral palette to bleed through, maintaining a sense of place.

---

## 3. Typography
We utilize a dual-font strategy to balance character with utility.

*   **Display & Headlines (Plus Jakarta Sans):** These are our "Editorial" anchors. Use `display-lg` and `headline-md` to announce data sections with confidence. The geometric nature of Plus Jakarta Sans provides a modern, intelligent edge.
*   **Body & Labels (Inter):** Inter is used for all operational data. Its high x-height ensures readability in complex parametric tables.
*   **Hierarchy Tip:** Use `label-md` in `on-surface-variant` (#404848) for metadata. The high contrast between `headline-sm` in `primary` (#003535) and supporting text in `secondary` (#48626e) creates an immediate visual path for the user’s eye.

---

## 4. Elevation & Depth
Elevation in this system is achieved through light and tone, not just shadows.

*   **The Layering Principle:** Depth is "stacked." A standard layout flow should look like this: `surface` (Base) → `surface-container-low` (Content Area) → `surface-container-lowest` (Interactive Card).
*   **Ambient Shadows:** When an element must float (e.g., a modal or a primary action menu), use an extra-diffused shadow. Set blur to `20px-40px` and opacity to `4%-6%`. The shadow color should be derived from `on-surface` (#1a1c1b), creating a naturalistic "glow" rather than a harsh drop shadow.
*   **The "Ghost Border":** If a border is required for accessibility (e.g., in a high-density data grid), use the `outline-variant` (#bfc8c8) at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Cards & Lists
*   **Style:** Use `xl` (0.75rem) roundedness for main cards and `lg` (0.5rem) for nested elements.
*   **Structure:** Never use horizontal dividers between list items. Instead, use a `3` (0.75rem) or `4` (1rem) spacing gap. Separation is achieved through vertical rhythm and white space.

### Buttons
*   **Primary:** `primary` (#003535) background with `on-primary` (#ffffff) text. Apply a subtle `0.25rem` shadow on hover to simulate physical press.
*   **Secondary:** `secondary-container` (#cbe7f5) background with `on-secondary-container` (#4e6874) text. This provides a softer, "utility" feel.
*   **Tertiary:** Transparent background with `primary` text. Use for low-emphasis actions like "Cancel" or "View More."

### Input Fields & Controls
*   **Inputs:** Use `surface-container-highest` (#e2e3e0) for the field background with a `none` border. On focus, transition to an `outline` (#707978) "Ghost Border."
*   **Chips:** Use `secondary-fixed` (#cbe7f5) for active filters and `surface-container-high` (#e8e8e5) for inactive. Roundedness should be `full` (9999px) to contrast with the structured cards.

### Parametric-Specific Components
*   **Threshold Gauges:** Use `tertiary-container` (#643c00) for "Warning" thresholds and `primary` (#003535) for "Safe" states.
*   **Trigger Monitors:** Use a `surface-container-lowest` card with a `px` ghost border to highlight real-time data feeds.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins. A wider left margin for the primary headline creates an editorial, high-end feel.
*   **Do** use `spacing-12` (3rem) and `spacing-16` (4rem) to let high-value data visualizations breathe.
*   **Do** use `tertiary` (#462800) sparingly as a "sophisticated alert" color for parametric triggers.

### Don’t:
*   **Don’t** use pure black (#000000) for text. Always use `on-surface` (#1a1c1b) to maintain the "warm neutral" sophistication.
*   **Don’t** use 1px dividers to separate header from body. Use a background shift from `surface-container-low` to `surface`.
*   **Don’t** use bright, saturated "safety" greens. Stick to the deep, forest-toned `primary` for success states to maintain the professional vibe.
*   **Don’t** use `heavy purples` or vibrant "startup" gradients. This is a tool of record, not a social app.