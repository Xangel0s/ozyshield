---
name: Obsidian Stealth
colors:
  surface: '#111415'
  surface-dim: '#111415'
  surface-bright: '#373a3b'
  surface-container-lowest: '#0c0f10'
  surface-container-low: '#191c1d'
  surface-container: '#1d2021'
  surface-container-high: '#282a2b'
  surface-container-highest: '#323536'
  on-surface: '#e1e3e4'
  on-surface-variant: '#c4c5d7'
  inverse-surface: '#e1e3e4'
  inverse-on-surface: '#2e3132'
  outline: '#8e90a0'
  outline-variant: '#434655'
  surface-tint: '#b7c4ff'
  primary: '#b7c4ff'
  on-primary: '#002682'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#2151da'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffb59c'
  on-tertiary: '#5c1900'
  tertiary-container: '#a73400'
  on-tertiary-container: '#ffc9b7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59c'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#832700'
  background: '#111415'
  on-background: '#e1e3e4'
  surface-variant: '#323536'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1280px
---

## Brand & Style

This design system is built for high-performance security and infrastructure management. It prioritizes "deep dark" aesthetics to reduce ocular strain during long monitoring sessions while maintaining a sense of impenetrable authority. The visual style is **Corporate Modern** with a lean towards **Minimalism**, stripping away unnecessary decorative elements to focus on data integrity and actionable insights.

The personality is precise, technical, and vigilant. It evokes a "command center" feel through high-contrast text against a pure black void, ensuring that critical status indicators and security alerts are immediately legible.

## Colors

The palette is anchored by a **Pure Black (#000000)** background to achieve infinite contrast ratios for typography. 

- **Primary:** A deep, authoritative Blue (#1D4ED8) used for primary actions, active navigation states, and focus indicators.
- **Surface & Cards:** Containers use a dark charcoal grey (#1A1A1A) to provide subtle depth against the black background.
- **Borders:** Low-visibility borders (#262626) define boundaries without creating visual clutter.
- **Accents:** Success (Emerald), Warning (Amber), and Error (Rose) colors should be highly saturated to pop against the dark canvas.

## Typography

This design system utilizes **Inter** exclusively for its exceptional legibility at small sizes and its neutral, systematic character. 

Hierarchy is established through weight and color rather than excessive size shifts. Primary text should be Pure White (#FFFFFF), while secondary information (like labels or timestamps) should use a muted grey (#9CA3AF). High tracking (letter-spacing) is applied to uppercase labels to ensure clarity in dense data tables.

## Layout & Spacing

The layout follows a **Fixed Grid** approach for internal dashboards to ensure predictable data visualization. 

- **Grid:** A 12-column system on desktop with 16px gutters.
- **Rhythm:** A strict 4px base unit governs all padding and margins (4, 8, 12, 16, 24, 32).
- **Mobile:** Surfaces collapse to a single column with 16px side margins. 
- **Density:** High information density is preferred. Vertical spacing between list items is kept tight (8px to 12px) to maximize the amount of visible data on a single screen.

## Elevation & Depth

In a pure black environment, traditional shadows are ineffective. Depth is instead communicated through **Tonal Layering** and **Subtle Outlines**:

1.  **Level 0 (Floor):** Pure Black (#000000) for the main application background.
2.  **Level 1 (Cards/Containers):** Dark Grey (#1A1A1A) with a very thin (1px) border (#262626).
3.  **Level 2 (Modals/Popovers):** Slightly lighter grey (#262626) to simulate proximity to the user.
4.  **Interaction:** Hover states on interactive rows should use a subtle highlight (opacity 0.05 white) rather than a shadow.

## Shapes

The shape language is disciplined and modern. While the primary aesthetic is sharp and technical, **Rounded (0.5rem)** corners are used on cards and buttons to prevent the UI from feeling overly aggressive or "dated." 

- **Small elements:** (Checkboxes, Tags) use 4px (Soft) radius.
- **Standard elements:** (Buttons, Inputs, Cards) use 8px (Rounded) radius.
- **Interactive indicators:** Vertical pills or underlines in navigation remain sharp-edged to signify precision.

## Components

### Buttons
- **Primary:** Solid Deep Blue (#1D4ED8) with white text.
- **Secondary/Ghost:** Transparent background with a #262626 border. White text.
- **States:** On hover, primary buttons should brighten slightly. Ghost buttons should take on a #1A1A1A background.

### Input Fields
- Background: #000000 (Black).
- Border: #262626, turning to Blue (#1D4ED8) on focus.
- Placeholder Text: #4B5563 (Mid-grey).

### Cards & Surfaces
- Background: #1A1A1A.
- Padding: 20px or 24px depending on content density.
- Header: Separated by a 1px #262626 horizontal rule if the card contains complex lists.

### Chips & Badges
- Background: Low-opacity tint of the status color (e.g., 10% Blue for "Info").
- Text: Full-saturation status color for high legibility.
- Shape: 4px radius for a technical look.

### Data Tables
- Header Row: #121212 background with uppercase, tracked-out label typography.
- Row Dividers: 1px #1A1A1A. 
- Row Hover: Background transitions to #121212 for clear row scanning.