# Design

## Visual Theme

Obsidian Links is a compact utility, not a marketing site. The interface should feel like a warm, paper-toned work surface for quickly converting and checking links.

The physical scene: someone is in a chat, issue, or note, under normal daytime light, trying to turn an Obsidian URI into a shareable HTTPS link without losing flow. This calls for a light theme, restrained color, dense but readable controls, and immediate destination review.

## Color Strategy

Restrained product palette: warm tinted neutrals plus one terracotta accent. The accent is reserved for the primary action, focused controls, and high-signal ready states. It should not be used as decoration.

Use OKLCH values in CSS.

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Background | `--bg` | `oklch(96% 0.018 86)` | Page canvas |
| Surface | `--surface` | `oklch(98% 0.012 86)` | Panels and controls |
| Soft surface | `--surface-soft` | `oklch(93.5% 0.018 82)` | Disabled controls, code blocks |
| Text | `--ink` | `oklch(22% 0.017 75)` | Primary text |
| Muted text | `--muted` | `oklch(45% 0.018 75)` | Helper copy and labels |
| Border | `--faint` | `oklch(86.5% 0.018 82)` | Dividers and field borders |
| Accent | `--accent` | `oklch(56% 0.12 42)` | Primary action |
| Accent strong | `--accent-strong` | `oklch(48% 0.13 42)` | Hover and active action |
| Success | `--success` | `oklch(42% 0.095 142)` | Ready state |
| Danger | `--danger` | `oklch(46% 0.135 28)` | Error state |

Do not use pure black or pure white. Neutrals should stay warm. Avoid purple, blue-gray, neon, and gradient-heavy protocol visuals.

## Typography

Use the system UI stack for all text:

```css
ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Use the system mono stack for URIs and examples:

```css
"SFMono-Regular", Consolas, "Liberation Mono", monospace
```

Type hierarchy should be practical:

| Role | Size | Weight | Line height |
| --- | --- | --- | --- |
| Home title | `3.5rem` max | 750 | 1.02 |
| Page title | `2.45rem` max | 750 | 1.08 |
| Panel title | `1.85rem` max | 750 | 1.12 |
| Body | `1rem` | 400 | 1.55 |
| Large body | `1.12rem` | 400 | 1.55 |
| Label | `0.92rem` | 700 | 1.35 |
| Code | `0.9rem` | 400 | 1.55 |

Avoid display-sized typography inside link confirmation pages. Users are there to verify and act.

## Layout

- Converter first, branding second.
- Keep the home page two-column on desktop, with the converter owning the stronger column.
- Stack the converter above the brand copy on mobile.
- Keep confirmation pages centered, compact, and action-led.
- Route examples should scan like documentation rows, not repeated cards.
- Avoid nested cards and decorative card grids.

## Components

### Buttons

Buttons use one shape vocabulary: 8px radius, 44px minimum height, subtle ring shadows, and clear disabled states.

Primary buttons use the terracotta accent. Secondary buttons use warm surfaces. Hover states should communicate affordance without shifting layout.

### Inputs

Textarea fields should be calm, readable, and monospaced. Focus uses an accent ring with a clear border color. Text and generated URIs must wrap safely.

### Status

Use inline status chips with a small dot. Do not use side-stripe borders. Status text should answer the next action, such as "Ready to copy" or "Ready to open".

### Code Blocks

Use warm soft surfaces, full wrapping for long URLs, and no horizontal-only layouts for critical destination details.

### Disclosure

Long agent-facing instructions belong in a native disclosure section. Keep the default page focused on conversion and review.

## Motion

Use motion only for lightweight state feedback. Product pages should load directly into the task.

- Duration: 160 to 220 ms.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
- Do not animate layout properties.
- Respect `prefers-reduced-motion`.

## Accessibility

- Maintain visible focus states for links, buttons, textareas, and disclosure controls.
- Keep touch targets at least 44px.
- Preserve readable contrast on muted text and disabled controls.
- Avoid relying on color alone for status. Pair color with text and dot shape.
- Ensure URI outputs wrap on narrow screens without clipping.

## Content Rules

- Use fictional examples only: `DemoVault`, `Inbox/Test.md`, `Example Note`, and `Example query`.
- Never include real vault names, note titles, local paths, or personal data.
- Keep copy concrete and short.
- Explain security constraints where they affect trust: whitelisted actions, hash parameters, no third-party resources, explicit auto-open.
