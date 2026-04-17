# QR Tool Layout Tightening Design

Date: 2026-04-17
Project: QR Tool PWA layout tightening pass
Related Spec: [2026-04-17-qr-tool-pwa-design.md](/Users/gup/repo/tools/docs/superpowers/specs/2026-04-17-qr-tool-pwa-design.md)
Visual System: Follow [DESIGN.md](/Users/gup/repo/tools/DESIGN.md)

## 1. Goal

Tighten the current QR Tool interface so the main workflow feels denser, more direct, and more QR-first without changing core functionality.

This pass is strictly about layout, hierarchy, and copy reduction.

## 2. Scope

### In Scope

- reduce vertical whitespace and panel padding
- make the QR preview feel larger and more dominant
- swap desktop columns so the QR panel sits on the left
- move mobile toward a QR-first stacked layout
- collapse the Style section by default
- remove nonessential helper copy called out by the user

### Out of Scope

- changing QR generation logic
- changing clipboard/share-target behavior
- changing saved data structures
- adding new features

## 3. Layout Direction

### Mobile

Mobile should follow the denser QR-first direction previously labeled as "B":

- QR card first
- primary actions immediately below the QR card
- text input below the actions
- collapsed Style section below input
- history/favorites below Style

The first screen should feel like opening a tool, not reading a page.

### Desktop

Desktop should keep a two-column layout, but the current left/right emphasis should be reversed:

- left column: QR preview card and primary actions
- right column: input, paste/clear controls, collapsed Style section, history/favorites

This change should solve the current issue where the interface feels input-first instead of QR-first.

## 4. QR Preview Requirements

- the QR card must become the dominant visual object
- reduce the card's internal padding so the code itself occupies more area
- keep the QR square visually centered
- preserve a clean white card surface for scan reliability
- keep the save action visually attached to the QR panel

“二维码要撑满” is interpreted as maximizing QR presence inside the preview card while preserving enough white margin for reliable scanning.

## 5. Style Section Behavior

The Style section should be collapsed by default on both mobile and desktop.

Collapsed state:

- single compact row
- clear label such as `Style`
- chevron or disclosure affordance
- no visible controls until expanded

Expanded state:

- show existing size, margin, foreground, background, and error-correction controls
- maintain current behavior and persistence

This change is about reducing first-screen clutter, not removing configurability.

## 6. Copy Removal

Remove these strings completely:

- `Offline QR Tool`
- `Content`
- `Edited manually`
- `If download is blocked on iPhone, long-press the QR card to save the image.`

Do not replace them with equivalent helper copy in the same positions unless a later requirement explicitly calls for it.

The tightened layout should rely more on structure and affordance than explanatory text.

## 7. Spacing and Density

Apply a compact pass across the shell:

- reduce top padding
- reduce inter-section gap
- tighten QR/action/input grouping
- avoid tall empty areas above or below the QR card
- keep history and favorites lower priority in the scroll order

The result should feel intentional and compressed, but not crowded.

## 8. Interaction Notes

- removing the `Edited manually` label means source/status feedback should no longer occupy a visible always-on slot in the preview region
- removing the `Content` label means the textarea should rely on placement and placeholder for identification
- collapsing Style by default must not break keyboard or touch interaction

## 9. Acceptance Criteria

This layout pass is complete when:

- desktop shows QR on the left and controls on the right
- mobile shows a QR-first stacked layout
- the QR card is visibly larger and denser than before
- Style is collapsed by default
- the four specified copy strings are removed
- the page feels tighter without breaking the existing workflow
- QR generation, saving, history, favorites, clipboard import, and share-target behavior still work
