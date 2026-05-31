---
name: graphify
description: Run graphify knowledge-graph extraction, author semantic JSON, and interpret the analysis report for this repo
---

## What I do

- Run the graphify MCP tool to extract a knowledge graph from the codebase
- Author `.graphify/.graphify_semantic.json` with nodes and edges for domain types, contexts, screens, services, hooks, utilities, DB tables, architectural patterns, and test coverage
- Re-run extraction with `--semantic` to produce an enriched graph
- Read `.graphify/.graphify_analysis.json` and interpret gods, surprises, low-cohesion communities, and isolated nodes
- Recommend and action structural improvements based on the analysis

## Package name

The npm package is `graphifyy` (double-y). The MCP server is already configured in `opencode.json`. Run via:

```
npx graphifyy@latest <args>
```

## Workflow

### Decide: full run vs incremental

**First, check if the graph is stale:**

```
npx graphifyy@latest check-update .
```

Then choose the right path:

| Situation | Command |
|---|---|
| First ever run (no `.graphify_semantic.json`) | Full workflow below |
| Code edits only — no new screens, hooks, or concepts | `npx graphifyy@latest update .` — done |
| New files added (new screen, hook, util, type, test) | Delta semantic authoring + `extract --semantic` |

---

### Full workflow (first run or major restructure)

#### 1. Initial extraction

```
npx graphifyy@latest extract . --backend claude-cli
```

This writes `.graphify/scratch/assistant-extract-instructions.md` listing which files need semantic analysis. Read that file before authoring the semantic JSON.

#### 2. Author `.graphify/.graphify_semantic.json`

Write nodes and edges covering:

- **Domain types** — `FoodEntry`, `WaterEntry`, `Ingredient`, `UserProfile`, `BowelEntry`, etc.
- **Contexts** — `AuthContext`, `TrackingContext`
- **Screens** — one node per tab/auth screen
- **Services** — `trackingService`, `supabase` client
- **Hooks** — form hooks, `useAuth`, `useTracking`
- **Utilities** — `dateUtils`, `foodHelpers`, `waterHelpers`
- **DB tables** — `food_entries`, `water_entries`, etc.
- **Architectural patterns** — file-based routing, context-only state, RLS, etc.
- **Test files** — one node per test file, with `"tests"` / `"exercises"` edges to their production subjects

#### 3. Semantic extraction

```
npx graphifyy@latest extract . --semantic .graphify/.graphify_semantic.json
```

---

### Incremental workflow (new files added)

**Do not author from scratch.** The semantic JSON already exists — read it first, then only append or modify nodes/edges for changed or new files.

#### 1. Find what changed

```
npx graphifyy@latest detect-changes .
```

Or inspect git diff to identify new/renamed files that need new semantic nodes.

#### 2. Read existing semantic JSON

Read `.graphify/.graphify_semantic.json` to understand existing node IDs and avoid duplicates.

#### 3. Append only the new nodes and edges

Add nodes for any new screens, hooks, components, utils, or test files. Add edges connecting them to existing nodes. Do not re-author nodes that haven't changed.

#### 4. Re-run semantic extraction

```
npx graphifyy@latest extract . --semantic .graphify/.graphify_semantic.json
```

---

### 4. Read the analysis

```
.graphify/.graphify_analysis.json
```

Key sections to check:
- **gods** — nodes with unusually high degree; candidates for splitting
- **surprises** — nodes in unexpected communities
- **low-cohesion communities** — structural smell; look for shared types stranded in the wrong community
- **isolated / weakly connected nodes** — often test-internal RTL helpers (`getByText` etc.) extracted by the AST; fix by adding explicit test→subject edges in the semantic JSON

---

### `file_type` valid values

`"code"` | `"concept"` | `"document"` | `"image"` | `"paper"` | `"rationale"`

- `"test"` is **not** valid — use `"code"` for test files
- JSON comments (`//`) are **not** valid in the semantic JSON file — strip them before running extract

### Edge types for test coverage

```json
{ "source": "test_ingredient_form", "target": "component_ingredient_form", "type": "tests" }
{ "source": "test_food_helpers",    "target": "util_food_helpers",         "type": "exercises" }
{ "source": "test_tracking_context","target": "context_tracking",          "type": "uses_types_from" }
```

## Baseline graph (as of 2026-05-31)

542 nodes · 826 edges · 58 communities

Semantic JSON lives at `.graphify/.graphify_semantic.json` — always read it before authoring new nodes.

## Key discoveries from first run

- Community 0 had low cohesion (0.06): `Unit`, `Ingredient`, `IngredientFormData` were co-located with water-form code because they're shared but had no dedicated home — fixed by extracting `types/ingredient.ts`
- 250 "weakly connected" isolated nodes were RTL helpers (`getByText`, `getByTestId`) extracted by the AST — fixed by adding explicit `"tests"` / `"exercises"` edges from test file nodes to their production subjects
- `export type { X } from './module'` does **not** bring `X` into scope within the same file — must also `import type { X }` separately before re-exporting
