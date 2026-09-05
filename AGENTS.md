# FoodTrackerApp — OpenCode Rules

A React Native / Expo health tracker. Primarily a **mobile app** (iOS + Android). TypeScript strict mode throughout. Data is persisted to Supabase; users authenticate with Supabase Auth.

## Project Structure

```
app/          # Expo Router file-based routes
app/(auth)/   # Auth screens: sign-in, sign-up (unauthenticated)
app/(tabs)/   # Tab screens: index (Home), food, water, profile, stats (authenticated)
components/   # UI components; tests in components/__tests__/<subfolder>
hooks/        # AuthContext, TrackingContext (global state) + form hooks
lib/          # supabase.ts (client singleton), trackingService.ts (persistence layer)
types/        # All domain types — import from types/tracking.ts
utils/        # Pure helpers: dateUtils, foodHelpers, waterHelpers
styles/       # StyleSheet files, one per screen/component group
constants/    # Colors.ts — light/dark palette tokens
supabase/     # migrations/001_initial_schema.sql — run once in Supabase Dashboard
docs/         # ARCHITECTURE.md, TECHNICAL_DECISIONS.md, TDRs
```

## Key Conventions

- **State**: React Context only (`hooks/AuthContext.tsx` for auth, `hooks/TrackingContext.tsx` for data). No Redux/Zustand.
- **Auth**: `useAuth()` from `hooks/AuthContext.tsx`. Never access `supabase.auth` directly in components.
- **Persistence**: All Supabase calls go through `lib/trackingService.ts`. Never import `supabase` in components or screens — only in `trackingService.ts`.
- **Routing**: Expo Router file-based. Never manually configure routes.
- **Types**: All domain types in `types/tracking.ts`. Form data types are separate from domain types.
- **Styling**: `StyleSheet.create()` in `styles/`. No inline styles. Use `ThemedText`/`ThemedView` over raw RN primitives.
- **Charts**: `@shopify/react-native-skia` only — do not add other chart libraries.
- **Photos**: Use `expo-image-picker` for camera/library access. One photo per meal entry, stored as a URI string on `FoodEntry.photoUri`. Photo state must remain independent of ingredient state (AI analysis hook writes to ingredients only).
- **IDs**: Use `generateId()` from `utils/dateUtils.ts` (timestamp-base36 + random hex). Never use bare `Date.now()`.
- **Date/time**: Always create timestamps via `utils/dateUtils.ts`. ISO strings for storage; `Date` objects only in UI.

## Testing

- Framework: Jest + `@testing-library/react-native`
- Tests **must** live in the appropriate subfolder of `components/__tests__/`:
  `forms/`, `lists/`, `modals/`, `screens/` — never in the root of `__tests__/`
- Prefer behavioural tests over snapshots.
- **Global mocks** in `jest.setup.ts`: `lib/supabase`, `lib/trackingService`, `hooks/AuthContext`, `expo-secure-store` — tests run fully offline.
- **Async context pattern**: tests rendering `TrackingProvider` must wait for the initial `load()` to settle before asserting on state (`await waitFor(() => loading === 'ready')`).
- Run tests: `npm test`

## Graphify — Orient Before Reading Docs

This repo has a pre-built, committed knowledge graph at `.graphify/` (`graph.json`, `GRAPH_REPORT.md`). A `.husky/post-commit` hook keeps it structurally current automatically — do not rebuild it manually unless `graphify` reports it stale.

**Before reading `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DECISIONS.md`, or grepping across the codebase for context on existing code**, query the graph first — it's cheaper and more targeted:

```
npx graphifyy@latest summary .graphify/graph.json          # first-hop orientation: hubs, communities
npx graphifyy@latest explain "<NodeName>" --graph .graphify/graph.json   # connections for one node
npx graphifyy@latest minimal-context <file> --graph .graphify/graph.json # compact context + risk for a file
npx graphifyy@latest path <source> <target> --graph .graphify/graph.json # how two nodes connect
```

Fall back to reading full docs/source only when the graph doesn't answer the question (e.g. it lacks semantic/conceptual detail, or `check-update` reports it stale relative to `HEAD`).

**If a task introduces a new pattern or concept** (new hook category, new architectural pattern, new domain type) that the graph should know about semantically — not just structurally — update `.graphify/.graphify_semantic.json` per `.opencode/skills/graphify/SKILL.md`'s incremental workflow, then re-run `extract --semantic`, before closing the task. The post-commit hook only handles structural (AST-derived) freshness; semantic authoring is a judgment call the hook can't make.

**Expected one-commit lag — do not "fix" it with a standalone commit.** After every commit, the hook restages `.graphify/graph.json`/`GRAPH_REPORT.md`/`scope.json` with `head` set to the commit that just landed — but that restaged file describes a commit that's already sealed, so `check-update`/`scope.json` will always show the graph one commit behind `HEAD` until something else is committed. This is expected and self-resolving: the staged delta rides along with whatever the next real commit is. Committing it on its own just advances `HEAD` again and reproduces the same one-commit lag immediately — it cannot converge that way, so don't try.

## Documentation Protocol

Documentation must be kept current as part of every feature or fix. Apply these rules **before marking a task done** — scoped to files actually touched by the change, not a full-document review pass.

### Always — every non-trivial change
- **`docs/ARCHITECTURE.md`**: Update only the sections affected by the files you changed (use `graphify affected-flows`/`review-context` to scope this). This includes component lists, data-flow diagrams, tech-stack versions, styling architecture, and known limitations. Remove stale content; do not just append.

### When a new coding pattern is introduced
- **`.github/copilot-instructions.md`**: Add or revise the relevant section (component patterns, utility conventions, testing rules, etc.) so the next feature follows the same pattern automatically.

### When a significant decision is made
TDRs live one-per-file in **`docs/decisions/NNN-slug.md`**, indexed at **`docs/TECHNICAL_DECISIONS.md`** (check that index for the next number — do not hardcode it here, it changes every time a TDR is added). Add a new file following the existing naming pattern (`NNN-slug.md`, zero-padded) and add a row to the index table:

```markdown
## TDR-XXX: [Title]
**Date**: YYYY-MM-DD
**Status**: Accepted
**Context**: Why this change was needed
**Decision**: What was decided and why; alternatives considered
**Consequences**: Trade-offs and implications
```

**A TDR is required for:**
- New external dependency added
- New screen, tab, or navigation pattern
- New global state shape (context fields added/removed/renamed)
- Data persistence introduced or changed
- New component category or test subfolder added
- Architectural pattern changed (styling, typing, ID generation, etc.)

**A TDR is NOT required for:**
- Bug fixes and refactors that don't change patterns
- Adding a new component that follows an existing pattern
- Style or copy changes

### When architecture diagrams need updating
Update or create draw.io diagrams in `docs/diagrams/` when:
- A new screen, tab, or major component is added
- Data flow through `TrackingContext` changes
- A new TDR is written that changes component relationships

Diagram files live at `docs/diagrams/*.mmd` (existing Mermaid) and `docs/diagrams/*.xml` (draw.io). Prefer draw.io XML for new diagrams — see the **draw.io Diagram Rules** section below.

### Checklist before committing a feature
- [ ] `docs/ARCHITECTURE.md` reflects the current state (no stale sections)
- [ ] `.github/copilot-instructions.md` updated if a new pattern was introduced
- [ ] TDR added to `docs/TECHNICAL_DECISIONS.md` if criteria above are met
- [ ] `AGENTS.md` updated if project structure or conventions changed
- [ ] `docs/diagrams/` updated if component structure or data flow changed

## draw.io Diagram Rules

Use this workflow when creating or updating architecture diagrams.

### Browser injection — loading XML into the live editor

`window.sb.editorUi` is the live `EditorUi` instance (not `window.App` or `window.EditorUi`).

```js
// Load XML
const ui = window.sb.editorUi;
const doc = mxUtils.parseXml(xmlString);
ui.editor.setGraphXml(doc.documentElement);

// Fit to screen after loading
window.sb.editorUi.editor.graph.fit();
```

`mxUtils` is available globally. The "Edit Diagram" textarea (Extras menu) is not accessible via DOM — always use `setGraphXml()`.

### Colour palette (IBM Carbon — colourblind-safe)

| Role | Fill | Stroke |
|---|---|---|
| Normal step | `#D0E8FF` | `#648FFF` |
| Exception / loop | `#FFF3CD` | `#FFB000` |
| Success / final | `#D6F5E3` | `#24A148` |
| Cancel / reject | `#FFD6E8` | `#DC267F` |
| Branch diamond | `#FFE0C2` | `#FE6100` |
| Panel / path (purple) | `#E8D5FF` | `#785EF0` |

### XML authoring rules

- **Z-order:** declare background panels **first** in the XML; foreground content after — later elements render on top.
- **Font size in HTML cells:** use `<span style="font-size:9px;">` inside `html=1` cells, not `<font size="9">`.
- **HTML entities in `value=`:** use `&lt;` `&gt;` `&quot;` `&amp;`; line breaks with `&lt;br&gt;`.
- **Swimlane backgrounds:** plain rectangles with `opacity=30` — avoid draw.io native swimlane containers (they add unwanted chrome).
- **Loop boxes:** plain rectangle, `fillColor=none`, coloured dashed stroke, `fontStyle=1`, `verticalAlign=top`.
- **Lifelines (sequence diagrams):** dashed edge (`dashed=1`) from actor header down to a terminal ellipse at the bottom.
- **Point-to-point edges (no attached nodes):** use `<mxPoint as="sourcePoint">` / `<mxPoint as="targetPoint">` inside `<mxGeometry>` — omit `source=` and `target=` on the cell.
- **Page size for complex diagrams:** `pageWidth="1654" pageHeight="1169"` (A3 landscape).

### QA workflow

1. Open `https://app.diagrams.net/` in Chrome.
2. Inject XML via `window.sb.editorUi.editor.setGraphXml()`.
3. Call `.fit()` to zoom to fit.
4. Take a screenshot to visually verify colours, labels, edges, z-order.
5. Save the XML to `docs/diagrams/<name>.xml`.

## MCP: Mobile Device Integration

`mobile-mcp` is configured in `opencode.json`. It connects to a running Android emulator via ADB and lets OpenCode:

- Take screenshots of the running app
- Read the full UI accessibility tree
- Tap, swipe, type, and press buttons
- List installed apps and launch/terminate them

**Prerequisites before using mobile-mcp tools:**
1. Start an Android emulator: `emulator -avd <AVD_NAME>` (or launch from Android Studio)
2. Verify ADB sees it: `adb devices`
3. Build and install the dev build: `npm run android`

Once the app is running on the emulator you can ask OpenCode to take a screenshot, inspect UI elements, or drive interactions to verify behaviour after code changes.


- Sleep and Stress tracking not yet started
- Data persists to Supabase — SQL migration in `supabase/migrations/001_initial_schema.sql` must be run once in Supabase Dashboard before the app works end-to-end
- CI uses Node 18 but `.nvmrc` pins Node 20 — align before changing CI
