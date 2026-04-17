# QR Tool PWA Design

Date: 2026-04-17
Project: Mobile-first offline QR generation tool
Visual System: Follow [DESIGN.md](/Users/gup/repo/tools/DESIGN.md)

## 1. Goal

Build a mobile-first QR code tool as an installable offline PWA.

The tool must:

- accept arbitrary string input
- generate a QR code locally with no backend dependency
- install to the phone home screen and continue working offline
- support saving the generated QR code as an image
- prioritize phone ergonomics and low-friction repeated use

The product is not a generic landing page. It is an offline utility with a polished, Apple-inspired interface defined by [DESIGN.md](/Users/gup/repo/tools/DESIGN.md).

## 2. Product Scope

### In Scope

- installable PWA
- offline operation after initial install
- arbitrary text input
- real-time QR generation
- clipboard read attempt on startup
- clipboard read attempt whenever the app returns to foreground
- explicit fallback action: "Paste and Generate"
- PNG export
- style controls for QR rendering:
  - size
  - margin
  - foreground color
  - background color
  - error correction level
- local history
- local favorites
- Android share target support for text and URLs
- iPhone fallback flow through home-screen app launch and clipboard handling

### Out of Scope for First Version

- image decoding into QR content
- file import parsing beyond shared text or URLs
- SVG export
- QR logo embedding
- custom dot shapes or finder patterns
- user accounts or cloud sync
- server APIs

## 3. Platform Strategy

### Android

Installed PWA registers as a system share target via `manifest.share_target`.

Expected behavior:

- user shares text or URL from another app
- share sheet shows this tool
- selecting the tool opens the app directly into a generated QR state
- shared content is treated the same as manually entered content and can enter history/favorites

### iPhone

Pure PWA does not rely on a system-level share target.

Expected behavior:

- user installs the app to the home screen
- app attempts clipboard read on initial load
- app attempts clipboard read when returning to foreground
- if clipboard read succeeds and content differs from current content, input updates and QR re-renders
- if clipboard read fails, app silently falls back to the manual paste action

This keeps parity on the main job to be done without promising unsupported OS integration.

## 4. Primary User Flows

### Flow A: Launch and Generate

1. User opens the installed app.
2. App restores prior state.
3. App attempts clipboard read.
4. If new clipboard text is available, input is populated and QR is generated.
5. Otherwise user types or taps "Paste and Generate".

### Flow B: Return From Background

1. User copies new content elsewhere.
2. User returns to the app.
3. App attempts clipboard read on foreground resume.
4. If the clipboard content is new and the user is not actively editing, the app updates the input and QR.
5. On failure, nothing disruptive happens.

### Flow C: Android Share Sheet Entry

1. User shares text or a URL from another app.
2. Android share sheet includes this installed PWA.
3. User selects the tool.
4. App opens with shared content already loaded.
5. QR is generated immediately.

### Flow D: Save QR Image

1. User adjusts content or style.
2. User taps "Save PNG".
3. App exports the current QR to PNG.
4. If download behavior is browser-limited, app shows a concise fallback instruction.

## 5. Information Architecture

The interface is a focused single-screen tool with four functional sections.

### A. Input Section

- primary text input for arbitrary content
- "Paste and Generate" action
- clear/reset action
- optional lightweight source indicator when content came from clipboard or Android share target

### B. Preview Section

- central QR card treated as the main object on the page
- stable preview height to avoid layout jump
- primary "Save PNG" action
- lightweight scanability warning when style contrast is risky

### C. Style Controls Section

- grouped controls for size, margin, foreground color, background color, error correction level
- immediate visual updates
- mobile-first controls with large hit areas
- collapsed or segmented presentation to keep the page clean

### D. Memory Section

- recent history list with limited length
- favorites list
- one-tap restore interaction

## 6. Interaction Rules

### QR Generation

- input changes re-render immediately
- style changes re-render immediately
- rendering is local-only

### Clipboard Handling

- attempt once on initial load
- attempt on every foreground resume
- ignore failures silently
- only overwrite current content when clipboard content is different
- do not auto-overwrite while the user is actively editing

### Save Behavior

- PNG is the primary export format
- export uses the currently rendered QR and current style settings
- if direct download is restricted, show platform-appropriate fallback guidance

### History and Favorites

- restoring a prior item updates input and QR immediately
- history is capped to avoid unbounded storage growth
- favorites are explicit user-managed entries

## 7. Visual Direction

Use [DESIGN.md](/Users/gup/repo/tools/DESIGN.md) as the source of truth.

### Visual Principles

- Apple-inspired restraint, not decorative novelty
- QR preview treated like the product hero
- black and light-gray section rhythm
- blue as the only accent for interactive elements
- dense, tight headline typography and clean body typography
- soft rounded controls, low-border UI, restrained elevation

### Practical Translation

- primary workspace uses dark immersive surfaces
- settings/history can sit on light-gray informational surfaces
- primary actions use the blue accent
- no gradients, textures, or extra accent colors
- avoid heavy shadows and ornamental chrome

## 8. Offline Architecture

The app is delivered as a static PWA.

Core assets:

- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `sw.js`
- app icons
- bundled QR generation dependency

Service worker responsibilities:

- precache app shell and essential static assets
- allow the app to boot offline after first successful install/load
- update conservatively so active sessions are not disrupted

No server round-trips are required for QR generation or style application.

## 9. Data Storage

Use browser-local storage for lightweight persistence.

Persist:

- last input value
- style settings
- recent history
- favorites
- auto-clipboard-read preference

Constraints:

- keep history capped at 10 recent entries
- store text records, not generated image binaries
- recover safely to defaults if stored state is corrupt

## 10. Error Handling

Errors should degrade gracefully and avoid blocking the main task.

- clipboard read denied: ignore and keep manual paste path available
- malformed or empty share payload: fall back to normal input state
- QR render error: keep the input, show a short inline error
- PNG save failure: present concise fallback guidance
- invalid restored style values: reset only the bad values to defaults

## 11. Compatibility Targets

Primary:

- iPhone Safari installed to home screen
- Android Chrome installed as PWA

Secondary:

- desktop browser use for testing and fallback access

Expected platform differences are explicit:

- Android supports system share target entry
- iPhone does not rely on share target support and uses clipboard-first recovery instead

## 12. Acceptance Criteria

The first version is complete when all of the following are true:

- the app can be added to the phone home screen
- after initial install/load, the app opens and works offline
- arbitrary string input generates a QR code immediately
- startup and foreground resume both attempt clipboard reads without breaking the UI on failure
- "Paste and Generate" always remains available
- Android share sheet can open the installed app with shared text or URL and generate immediately
- style controls update the rendered QR immediately
- user can save the QR as PNG, with fallback guidance where download behavior is limited
- history, favorites, and current style settings persist locally
- the visual implementation follows [DESIGN.md](/Users/gup/repo/tools/DESIGN.md)

## 13. Implementation Notes

Recommended implementation shape:

- keep the app as a single-page utility
- separate pure QR rendering logic from UI state handling
- keep share-target intake, clipboard intake, and manual input on one normalization path
- validate style changes before render so bad values do not poison app state

This keeps the codebase small, testable, and aligned with the single-purpose nature of the tool.
