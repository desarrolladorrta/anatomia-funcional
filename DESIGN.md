---
name: "Mision Esqueleto"
description: "Una bandeja de instrumental anatomico para inspeccionar, clasificar y liberar el esqueleto."
colors:
  ink: "#eef5f5"
  muted: "#aebec3"
  dim: "#70838b"
  navy-950: "#061019"
  navy-900: "#0b1824"
  navy-850: "#102230"
  navy-800: "#17303d"
  steel: "#8ca3aa"
  steel-line: "rgba(184, 209, 214, 0.24)"
  paper: "#e8e7dd"
  paper-ink: "#15252c"
  cyan: "#55d5df"
  cyan-soft: "#a6edf0"
  coral: "#ff765f"
  coral-soft: "#ffb2a2"
  yellow: "#f3d36b"
  danger: "#ff8e7d"
  success: "#73e3bd"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(4.7rem, 10vw, 9.2rem)"
    fontWeight: 800
    lineHeight: 0.78
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2.7rem, 6vw, 5.3rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "0.76rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.16em"
rounded:
  control: "2px"
  dialog: "3px"
  round: "50%"
spacing:
  xs: "0.5rem"
  sm: "0.8rem"
  md: "1rem"
  lg: "1.25rem"
  xl: "2rem"
  xxl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.control}"
    padding: "0.85rem 1.2rem"
    height: "3.25rem"
  button-primary-hover:
    backgroundColor: "{colors.cyan-soft}"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.control}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.control}"
    padding: "0.85rem 1.2rem"
    height: "3.25rem"
  field:
    backgroundColor: "rgba(255, 255, 255, 0.54)"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.control}"
    padding: "0.7rem 0.85rem"
    height: "3rem"
---

# Design System: Mision Esqueleto

## Overview

**Creative North Star: "La bandeja de instrumental anatomico"**

The interface feels like a controlled university specimen station: deep navy steel surrounds an ivory paper work surface, measurement lines and serial labels organize evidence, and cyan/coral examination marks distinguish systems. It is clinical and mechanical without becoming cold, graphic without becoming a generic neon laboratory, and game-like without sacrificing academic credibility.

Density is purposeful. The mission table keeps the skeleton, five sequential closures, status readouts, and chain-of-custody details visible as one instrument. Challenge dialogs invert the environment into a bright paper compartment so sustained form work is legible. The final report returns to the dark room and uses an oversized release stamp as the earned visual payoff.

**Key Characteristics:**
- Dark steel room, ivory paper compartments, and fine measurement lines.
- Condensed uppercase display type paired with a highly legible humanist body face.
- Cyan for active examination, coral for anatomical contrast, green only for verified release.
- Square, bordered, mechanically aligned controls with almost no decorative rounding.
- Sequential opening of compartments as the signature interaction.

Asset boundaries are strict. `assets/logo-cecar.png` and `assets/favicon.ico` are supplied CECAR institutional marks; preserve their files and proportions rather than recreating or recoloring them. `assets/skeleton-mission.webp`, the bone specimen images in `assets/bones/`, and the four functional cases in `assets/movement-cases/` are shipped generated anatomy illustrations; each prompt and creation timestamp lives in its adjacent same-name JSON file, and no provider or external license is asserted. Interface icons are locally authored inline SVG paths in `src/main.js`. Atkinson Hyperlegible Next and Barlow Condensed are loaded from Google Fonts. Review screenshots are evidence, not reusable product assets.

## Colors

The normative values are the CSS-aligned tokens in frontmatter; use those names directly rather than introducing near-duplicate shades.

### Primary
- **Examination Cyan** (`cyan`, `cyan-soft`): active controls, axial legend marks, protocol labels, dialog rail, progress, and restrained informational emphasis.

### Secondary
- **Anatomical Coral** (`coral`, `coral-soft`): appendicular anatomy and the intro title incision; it is contrast, not the general action color.

### Tertiary
- **Release Green** (`success`): completed locks, success seals, the exit control, release stamp, and positive status only.
- **Attention Yellow** (`yellow`): keyboard focus and skip-link visibility.
- **Protocol Danger** (`danger`): the shared semantic source for failure and urgency; implemented error panels also use paper-specific red tints.

### Neutral
- **Room Navy** (`navy-950`, `navy-900`): page and browser-chrome foundations.
- **Tray Navy** (`navy-850`, `navy-800`): raised steel compartments, tray insets, and dark case files.
- **Clinical Paper** (`paper`, `paper-ink`): dialogs, intake/report sheets, fields, and their text.
- **Instrument Steel** (`steel`, `steel-line`): borders, dividers, scales, and low-contrast hardware.
- **Readout Text** (`ink`, `muted`, `dim`): primary text, explanatory copy, and de-emphasized/locked data.

**The Three-Signal Rule.** Cyan means inspect or proceed, coral means anatomical comparison, and green means verified completion; do not exchange these roles.

**The Material Pair Rule.** Long-form interaction happens on paper; navigation and mission context stay on navy steel.

## Typography

**Display Font:** Barlow Condensed, with Arial Narrow and sans-serif fallbacks.  
**Body Font:** Atkinson Hyperlegible Next, with system-ui and sans-serif fallbacks.

**Character:** Barlow Condensed makes headings read like specimen labels and equipment readouts. Atkinson Hyperlegible Next keeps dense instructions, form labels, and educational feedback readable across small screens.

### Hierarchy
- **Display:** Heavy, tightly tracked, uppercase, and compressed; reserved for the intro and release statements. The canonical fluid values are in frontmatter, while the report variant uses `clamp(4rem, 9vw, 7.8rem)` at `0.82` line-height.
- **Headline:** Condensed mission and dialog headings, uppercase, with compact line-height and negative tracking.
- **Title:** Condensed section instructions and case titles, usually uppercase.
- **Body:** Regular or medium Atkinson, generally `1.45-1.55` line-height; supporting paragraphs stay near `32-48rem` rather than spanning the viewport.
- **Label:** Small bold Atkinson, uppercase where it identifies protocols/readouts, with wide tracking and cyan, steel, or dim coloring.
- **Numerals:** Display face plus tabular numerals for timer, score, progress, station numbers, and result metrics.

**The Two-Voice Rule.** Use condensed type for identity, commands, station numbers, and outcomes; use Atkinson for every sentence a student must understand or enter.

## Layout

The desktop system uses centered fluid containers: the intro is capped at `86rem`, the mission at `82rem`, and the report at `74rem`, each with `3rem` total viewport gutter. Major vertical moves are fluid clamps, while component interiors recur around `0.5rem`, `0.8rem`, `1rem`, `1.25rem`, `2rem`, and `3rem`. Fine `1px` rules and aligned columns provide rhythm more often than empty card spacing.

The intro is a two-column split between dark mission copy and a paper intake sheet. The mission tray is a two-column instrument: skeleton stage at roughly two-fifths, five challenge closures at three-fifths. The report pairs a circular release stamp with the outcome, then spans metrics and a paper evidence panel across the container.

At `900px`, the intro stacks, the header and tray tighten, challenge descriptions hide, final-case forms reduce to two columns, and report actions stack structurally. At `680px`, the header becomes two rows and stops sticking; the tray becomes one continuous vertical specimen with skeleton above closures; descriptions return; footer labels disappear; challenge grids become one column; actions stack primary-first; reports use a two-by-two metric grid. Challenge dialogs become full-viewport (`100dvh`) with a narrow `3rem` cyan rail, sticky paper header, and independently scrolling body. The classification station uses the full viewport at every size: specimen and decision panel share the desktop canvas, then stack on phones while preserving the image and navigation in view; only the question panel may scroll as a fallback on very short screens. The implementation supports a minimum viewport width of `320px`.

**The Continuous Instrument Rule.** Related rows share one ruled container; do not break the tray, metrics, or challenge options into floating rounded cards.

## Elevation & Depth

Depth is a hybrid of tonal layering, inset hardware, borders, and a small shadow vocabulary. The room remains nearly flat; only physical sheets, trays, dialogs, toasts, and active buttons lift. Background grids, center lines, screws, measurement ticks, and translucent steel rules create dimensional evidence without ornamental gradients.

### Shadow Vocabulary
- **Tray / toast ambient:** `0 18px 45px rgba(0, 0, 0, 0.34)`; used with the tray's `inset 0 0 0 8px rgba(5, 15, 23, 0.4)` hardware lip.
- **Dialog lift:** `0 28px 80px rgba(0, 0, 0, 0.58)` over an `rgba(2, 9, 14, 0.82)` blurred backdrop.
- **Paper side cast:** `-22px 0 50px rgba(0, 0, 0, 0.18)` on the intake sheet.
- **Primary action:** `0 10px 24px rgba(44, 158, 168, 0.2)`, strengthening to `0 13px 30px rgba(44, 158, 168, 0.27)` on hover.

**The Structural Shadow Rule.** Shadows communicate a physical layer or an active control; ordinary rows and containers use rules and tonal changes instead.

## Shapes

The form language is machined and rectilinear. Controls use a nearly square `2px` radius, the dialog uses `3px`, and most structural surfaces have no radius. One-pixel steel borders, inset outlines, ruled rows, crosshair lines, scale ticks, and small circular screw heads make the tray feel fabricated. Circles are reserved for screws, legend dots, seals, and the final release stamp; they are not a general card treatment.

## Components

### Buttons
- **Primary:** Cyan field, navy text, `3.25rem` minimum height, bold label, compact `0.85rem 1.2rem` padding, inline line icon, and `2px` corners.
- **Hover / focus:** Hover shifts to cyan-soft, rises `2px`, and deepens its shadow over `180ms ease`. Keyboard focus always uses a `3px` yellow outline with `3px` offset. Disabled primary actions remain visible at `0.55` opacity.
- **Secondary:** Transparent paper control with a dark steel border; hover inverts to paper-ink with white text.
- **Quiet / text / hint:** Borderless and low-emphasis. Quiet actions brighten on hover; text actions use a current-color underline; hints underline on hover and become muted after use.

### Chips
- **Style:** Movement choices are compact rectangular paper chips with a fine steel border and bold small text; their native checkbox remains in the accessibility tree but is visually hidden.
- **State:** Selected chips fill deep cyan-steel with white text. Keyboard focus is drawn on the visible chip with the same thick yellow treatment. Selection must remain readable by fill and check state, not hue alone.

### Cards / Containers
- **Tray:** Navy-850, square, steel-bordered, inset-lipped, screw-capped, and split by one central rule; desktop padding is `2.75rem 2.75rem 4rem`.
- **Paper sheets:** Paper background with paper-ink text and repeated horizontal rules. Intake and report sheets use generous fluid padding rather than rounded card chrome.
- **Challenge slots:** Full-width ruled rows with station number, status copy, and a square lock cell. Available rows translate `0.65rem` and gain a faint cyan wash on hover; locked rows dim; completed rows turn their status cell green and replace the lock with a check.

### Inputs / Fields
- **Style:** Full-width translucent white fields on paper, `1px` steel-gray border, `2px` corners, dark ink, and a warm red caret. Inputs/selects are at least `3rem` high; textareas are at least `6rem` and resize vertically.
- **Focus:** Global `:focus-visible` is the yellow `3px` outline, independent of field color.
- **Error:** The invalid row receives a pale red wash and inset red border; controls receive `aria-invalid="true"`, feedback appears in a red paper panel, and focus moves to the first invalid control.
- **Disabled:** Cursor changes to not-allowed; component-specific color or opacity carries the visual state.

### Navigation
- **Mission header:** A dark translucent sticky bar with CECAR logo, bordered timer/score/progress readouts, and a quiet reset action. At phone width it becomes static and two rows, with readouts spanning the width and the reset label hidden.
- **Progression:** Challenge slots are the navigation. Only the current or completed station is enabled; future stations remain native disabled buttons.

### Challenge Dialog

The native modal dialog opens with `showModal()`: desktop uses a `5.5rem` cyan station rail and scrollable paper body; mobile uses a `3rem` rail and fills the viewport. Its header remains sticky, the close control is explicitly labeled, native modal focus/escape behavior is preserved, and the dark blurred backdrop isolates the task. Opening animates for `420ms` with opacity, upward translation, slight scale, and a top-down clip reveal. Verification replaces the form with a centered seal and recovered code; reopening a completed station shows a read-only summary.

The first station is a full-screen specimen wizard rather than a centered compartment. A compact header and linear progress readout frame one sample at a time. Desktop gives the specimen the leading left field and groups the prompt, two continuous answer rows, and status on the right; navigation stays anchored below both. Phone portrait keeps a reduced specimen above a scroll-safe question panel, with Back and Hint above the full-width primary action. Phone landscape returns to a compact split view. Images use `object-fit: contain`, preload only the next sample, and never determine the page height from their intrinsic dimensions.

The third station reuses the full-screen wizard for four named functional cases followed by one written synthesis. Each case image depicts the movement or loading situation without labels, exposed anatomy, or highlighted answers. The decision panel presents each bone as a selectable specimen tile with its image and name; an always-visible square communicates interactivity, then fills with a cyan check while the selected tile darkens. The matrix uses four columns on desktop, three on phones, and two at the narrowest supported width. Validation returns directly to the first incomplete case while preserving every choice. File slugs mirror the case names so content, image, alt text, and provenance remain traceable.

The second station is a full-screen cartography wizard with seven region steps and a final review. Each step names one body region in the dark evidence field; the paper panel presents the seven bone sets as single-select rows so the student assigns exactly one set per region. The review sheet lists every region with its chosen set, and validation returns to the first mismatched region while preserving the rest.

The fourth station is a full-screen blind-identification wizard with five clues and a final review. Each clue occupies the dark evidence field and deliberately exposes only location, shape, and function language rather than an image. The paper response panel repeats a three-step protocol: locate the region, name the bone in singular, and classify it as axial or appendicular. Both the text field and system choice are required before advancing. The review sheet lists all five names and systems, and validation returns to the first incorrect clue while preserving the remaining answers.

All wizard stations share one form grid (`auto minmax(0,1fr) auto auto auto`) so the progress readout and navigation stay pinned while only the active slide's answer panel scrolls; every new wizard form must be added to that shared grid rule or it will overflow the viewport.

### Reset Dialog

Resetting uses a dedicated paper compartment instead of a browser confirmation. A coral rail identifies the destructive context while two explicit choices separate scope: restarting challenges preserves the current student and creates a fresh session identifier; changing student removes the complete local session and returns to access. Cancellation is the initial focus target, Escape cancels safely, and the copy states that previously submitted rows cannot be removed. On phones the options stack without changing their order or meaning.

### Feedback And Motion

Failures cost score, mark exact rows, announce assertively, focus the first invalid control, and smoothly bring feedback into view. Hints reveal an inline dashed cyan panel and disable their trigger. Success updates the tray, progress bar, toast, and next lock; the toast is a polite live region visible for `3200ms`. Ordinary hover and toast transitions run `180ms ease`; progress uses `500ms cubic-bezier(0.16, 1, 0.3, 1)`. Under `prefers-reduced-motion: reduce`, smooth scrolling is removed and every animation/transition collapses to `0.01ms` for one iteration.

### Accessibility Baseline

Keep the Spanish document language, semantic headings, labels/fieldsets, native controls, alternative text, status live regions, `aria-invalid`, and descriptive disabled states. The skip link is visually clipped until focused, then appears as a yellow paper tab. Do not remove the universal focus ring, modal semantics, or keyboard access. Color supports status but text, icons, disabled state, checks, and feedback wording carry the same meaning.

## Do's and Don'ts

### Do:
- **Do** preserve the instrument-tray hierarchy: navy context, paper work surface, ruled compartments, and exact signal-color roles.
- **Do** retain CECAR logo proportions and use the existing white institutional raster on dark surfaces.
- **Do** keep educational copy in Atkinson and condensed uppercase type for protocol identity and outcomes.
- **Do** preserve native keyboard behavior, the yellow focus ring, live feedback, reduced motion, and the `320px` minimum layout.
- **Do** keep generated raster provenance adjacent to the asset in a same-name `.json` file.

### Don't:
- **Don't** turn the interface into a neon sci-fi dashboard, a soft rounded SaaS UI, or a collection of floating cards.
- **Don't** use coral for primary actions or green before verified completion.
- **Don't** place dense challenge forms directly on the dark room surface; they belong in paper compartments.
- **Don't** invent new anatomical imagery, modify institutional marks, or claim source/license details that are absent from asset provenance.
- **Don't** remove text labels in favor of color-only, icon-only, or motion-only status.
