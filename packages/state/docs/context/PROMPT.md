# Agent prompt: maintain `packages/state/docs/context`

Copy everything below the horizontal rule into a new task when updating Context documentation.

**Hard constraints**

- **Do not encapsulate** in prose or structure: no extra abstraction layers, facade wording, or “meta-provider” framing. Name **`TroottStateProvider`**, **`LegacyCompatContexts`**, **`UserContext`**, **`AppContext`**, **`helpers/types.ts`**, **`helpers/interface.ts`**, **`src/domains/*`** as they exist on disk.
- **Follow the repo reference folder exactly in spirit only**: **`docs/context/`** at the repository root is **read-only reference** for tone and patterns (flat action constants, explicit Context, Provider wiring). **Do not add, remove, or edit** any file under **`docs/context/`** while doing this work.
- Scope doc edits to **`packages/state/docs/context/`** and **`packages/state/README.md`** (plus **`packages/state/docs/adr/`** only if the user explicitly asks). Do **not** edit product plan attachments.

---

You are documenting **`packages/state`** for Troott. Follow the **exact documentation style** of the repo reference folder **`docs/context/`** at the repository root (flat action constants file, explicit Context components, Provider wiring, hooks that read those contexts).

### Goals

1. Maintain **`packages/state/docs/context/`** as the canonical “context reference” for this package.
2. Match the reference style: **explicit file paths**, **short runnable snippets** where they help, **tables** for wiring (who provides what), **no marketing fluff**, **no invented abstraction names**—name real files and exports.
3. Do **not** introduce another encapsulation layer in docs (no “facade layer,” “meta-provider,” etc.). Describe **`TroottStateProvider`**, **`LegacyCompatContexts`**, **`UserContext`**, **`AppContext`**, **`helpers/types.ts`**, **`helpers/interface.ts`**, and **`src/domains/*`** as they exist.

### Required layout (mirror `docs/context/` mentally)

Under **`packages/state/docs/context/`**, keep at minimum:

- **`README.md`** — Index table: each doc file and what source file(s) it corresponds to; one sentence on app root = **`TroottStateProvider`** from **`packages/state/src/index.ts`**.
- **`types.md`** — Full export-style listing of **`packages/state/src/helpers/types.ts`** action string constants (same vibe as **`docs/context/types.tsx`**).
- **`troott-state-provider.md`** — Explicit **import list** (each **`domains/<x>/<x>.context`** Provider) and **ASCII nesting** of providers in **`packages/state/src/TroottStateProvider.tsx`** (outer → inner), ending with **`LegacyCompatContexts`** then **`children`**.
- **`user-context.md`** — **`packages/state/src/user/userContext.tsx`** (`createContext`), pointer to **`IUserContext`** in **`helpers/interface.ts`**, note that real values come from **`LegacyCompatContexts`**.
- **`app-context.md`** — Same for **`app/appContext.tsx`** and **`IAppContext`**.
- **`use-context-type.md`** — Full snippet of **`packages/state/src/useContextType.tsx`**; requirement to render under **`TroottStateProvider`**.
- **`legacy-compat-contexts.md`** — Tables mapping **`IUserContext`** and **`IAppContext`** fields/methods → domain hooks + dispatch action constants (from **`helpers/types.ts`** where applicable). Name the file **`compat/LegacyCompatContexts.tsx`** explicitly.
- **`selectors.md`** — Snippet of **`hooks/selectors.ts`** (`useUserSelector` / `useAppSelector`).
- **`domain-modules.md`** — List **`src/domains/<name>/`** folders with **`Provider`** + **`useXxxState`** / **`useXxxDispatch`** exports; mention **`domains/_shared/createDomain.tsx`** only as **implementation detail** for split Context (state vs dispatch), not as a product concept.

Also update **`packages/state/README.md`** to link **`docs/context/README.md`** and state **`TroottStateProvider`** at app root (**do not** recommend nesting deprecated **`UserState`** / **`AppState`** unless bridging legacy).

### Style rules (non-negotiable)

- Prefer **`File: packages/state/src/...`** headers and **path literals** over vague descriptions.
- When showing code, prefer **complete small files** or **minimal excerpts** that compile mentally—same density as **`docs/context/user/userState.tsx`** (explicit imports, explicit dispatch types).
- Use **tables** for cross-cutting mappings (legacy context field → domain source).
- Do **not** edit the product plan file if the user attached one; only docs under **`packages/state`** as scoped above.
- Keep **`docs/adr/`** separate: ADRs record decisions; **`docs/context/`** records **how to read and wire** Context.

### Verification checklist (before you finish)

- [ ] Every major runtime entry (**`TroottStateProvider`**, **`LegacyCompatContexts`**, **`UserContext`**, **`AppContext`**, **`useContextType`**) has a dedicated doc: see **`README.md`** table **Runtime entry → doc**.
- [ ] **`types.md`** matches **`helpers/types.ts`** (no missing constants).
- [ ] Provider order in **`troott-state-provider.md`** matches **`TroottStateProvider.tsx`** nesting order.
- [ ] **`packages/state/README.md`** points to **`docs/context/README.md`** (and **`PROMPT.md`** if maintainers need it).
- [ ] **`selectors.md`** matches **`hooks/selectors.ts`** (including **`useMemo`**).
- [ ] **`legacy-compat-contexts.md`** lists **`IAppContext`** fields explicitly (not ellipses).
- [ ] **`domain-modules.md`** lists every **`src/domains/*`** folder with **`Provider`** + **`useXxxState`** / **`useXxxDispatch`**; notes **`auth`** hand-written in **`auth.context.tsx`**.

You can prepend your own constraints (e.g. “Do not change runtime code” or “Also update ADR”) when you paste this into a new chat or Cursor rule.
