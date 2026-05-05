---
name: Relocate native to apps/mobile
overview: Native projects belong under apps/mobile; root android/ios are removed; prebuild always runs with project root apps/mobile.
todos: []
isProject: true
---

# Relocate `android/` and `ios/` under `apps/mobile`

See prior plan sections (inventory, delete root native, `pnpm prebuild:mobile:clean`, reapply customizations, CI/EAS, docs).

## Recommendations (team defaults)

Apply these when **executing** the plan; they supersede ad hoc choices unless the team explicitly decides otherwise.

1. **Complete the relocation** — Remove repo-root **`android/`** and **`ios/`** (backup or diff first if anything was hand-edited). Regenerate natives **only** under **`apps/mobile`** with **`pnpm exec expo prebuild apps/mobile --clean --pnpm`** from the monorepo root (then reapply any native edits not expressible in `app.json` / plugins). Until this is done, **`expo run:*`** and IDE “open project” paths stay misaligned with the Expo package.

2. **Scripts** — Set root **`prebuild:mobile`** / **`prebuild:mobile:clean`** to **`pnpm exec expo prebuild apps/mobile … --pnpm`** as in **Scripts to pin the output directory** below. In **`apps/mobile/package.json`**, use **`expo prebuild .`** / **`expo prebuild . --clean`**. **Keep `--port 8177`** on **`start`** / **`ios`** (team convention).

3. **Git policy (default)** — **Commit** **`apps/mobile/android`** and **`apps/mobile/ios`** for a custom dev client and many native modules (reproducible local/CI/EAS builds). Use **gitignore + regenerate** only if the team explicitly wants zero generated native trees in git and accepts that workflow.

4. **Defer optional scripts** — Add **`expo export --output-dir ./build`**, **`eas-build-post-install`**, or package-only **`lint`/`test`** only when a real shipping or EAS requirement appears; root **turbo** may stay the main lint/test entry.

5. **Documentation** — Add a short note to [`apps/mobile/README.md`](apps/mobile/README.md): native output lives under **`apps/mobile`**; never run **`expo prebuild`** from the monorepo root without the **`apps/mobile`** project path; from root use **`pnpm prebuild:mobile:clean`** (after script updates) or run prebuild inside **`apps/mobile`**.

## Subsequent prebuild (after the one-time move)

Once native folders live under **`apps/mobile`**, every future prebuild must use **that** project root:

| Command                                                         | Effect                                                                                           |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| From repo root: **`pnpm prebuild:mobile`**                      | Should run prebuild with project dir **`apps/mobile`** (see scripts below).                      |
| From repo root: **`pnpm prebuild:mobile:clean`**                | Same with **`--clean`**.                                                                         |
| From **`apps/mobile`**: `pnpm prebuild` / `pnpm prebuild:clean` | **`expo prebuild .`** / **`expo prebuild . --clean`** — output is always this package directory. |

**Do not** run bare `expo prebuild` with **no directory** from the **monorepo root** — that treats the repo root as the project and regenerates **`/android`** and **`/ios`** at the root again.

### Scripts to pin the output directory

Expo supports an explicit project path: **`expo prebuild <dir>`** (default `<dir>` = current working directory).

**1) Monorepo root [`package.json`](package.json)** (strongest guard — works even if the shell cwd is wrong):

```json
"prebuild:mobile": "pnpm exec expo prebuild apps/mobile --pnpm",
"prebuild:mobile:clean": "pnpm exec expo prebuild apps/mobile --clean --pnpm"
```

- **`apps/mobile`** is the Expo project root; native folders are written to **`apps/mobile/android`** and **`apps/mobile/ios`**.
- **`--pnpm`** matches this repo’s package manager for any install step prebuild runs.

**2) [`apps/mobile/package.json`](apps/mobile/package.json)** (optional clarity when running inside the package):

```json
"prebuild": "expo prebuild .",
"prebuild:clean": "expo prebuild . --clean"
```

The **`.`** makes it obvious the output is the mobile package directory (`pnpm --filter @troott/mobile run prebuild` already sets cwd to `apps/mobile`, so this is equivalent to today’s scripts but self-documenting).

**Note:** Replacing root scripts that use **`pnpm --filter @troott/mobile run prebuild`** with **`pnpm exec expo prebuild apps/mobile`** is intentional: the **path argument** fixes the project root; the filter-only approach relies on cwd being the package and is easier to misuse from tooling that runs scripts differently.

### Related script patterns (do not confuse with prebuild)

A reference **`package.json` scripts** block (from another Expo app) can still be useful for **Troott mobile** if adapted:

```json
"scripts": {
  "dev": "expo start",
  "lint": "eslint --ext js,ts,tsx .",
  "test": "jest",
  "build": "expo export --output-dir ./build --platform all",
  "start": "expo start",
  "android": "expo run:android",
  "ios": "expo run:ios",
  "web": "expo start --web",
  "eas-build-post-install": "pnpm run -w build:example"
}
```

**Important distinction**

- **`expo export --output-dir ./build`** controls where **exported JS bundles / static web output** go (e.g. `./build` under the app package). It does **not** replace **`expo prebuild`** for **`android/`** and **`ios/`** native projects.
- **Native** output is still: **`expo prebuild <dir>`** (or **`expo prebuild .`** inside `apps/mobile`).

**Troott-specific adaptations** (when adding or aligning scripts in [`apps/mobile/package.json`](apps/mobile/package.json))

- Keep **`--port 8177`** on **`start` / `dev`** if that remains the team convention (or document a single port everywhere).
- **`lint` / `test`**: only add if ESLint/Jest are configured for `apps/mobile` (avoid copying blindly if the package uses root `turbo lint`).
- **`build` (`expo export`)**: optional; use if you ship static/web export from mobile. Point **`--output-dir`** at a path **under `apps/mobile`** (e.g. `./build`) so artifacts stay inside the app package; add `./build/` to `.gitignore` if not committed.
- **`eas-build-post-install`**: EAS runs this **after** `pnpm install` in the build environment. In a monorepo, a **workspace** script is common, e.g. `pnpm run -w <script>` to build a shared package Troott’s native build depends on. Replace **`build:example`** with a real root script (e.g. `turbo build --filter=@troott/some-package`) only if EAS requires it; omit if not needed.

**Idempotency:** Normal `expo prebuild` (no `--clean`) merges updates into existing `android`/`ios`; it does not move them back to the repo root.

**Custom native edits:** Anything not driven by `app.json` / config plugins can be **overwritten** on `--clean` or sometimes on prebuild. Prefer expressing changes via Expo config; otherwise reapply diffs after prebuild or maintain a small patch step documented in the mobile README.

**Git:** If you commit `apps/mobile/android` and `apps/mobile/ios`, subsequent prebuilds change many files — review diffs like any generated code. If you gitignore those dirs, teammates regenerate with the same pnpm scripts after pulling `app.json` / dependency changes.

## What is missing today (plan vs repo)

These are the **gaps between the intended end state and the current workspace**; nothing here is done until someone executes the relocation.

| Item                                          | Current state                                                       | Plan / target                                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Native location                               | **[`android/`](android)** and **`ios/`** at **repo root** only      | Only **`apps/mobile/android`** and **`apps/mobile/ios`**                                                            |
| **`apps/mobile` native dirs**                 | **Absent** (no `apps/mobile/android`)                               | Created by **`expo prebuild apps/mobile --clean`** (after removing root native)                                     |
| Root **`prebuild:mobile*`** scripts           | Still **`pnpm --filter @troott/mobile run prebuild`**               | Prefer **`pnpm exec expo prebuild apps/mobile --pnpm`** (explicit path + `--pnpm`)                                  |
| Mobile **`prebuild*`** scripts                | **`expo prebuild`** / **`expo prebuild --clean`**                   | Optional **`expo prebuild .`** / **`expo prebuild . --clean`** for clarity                                          |
| **`.gitignore`**                              | Comments reference `apps/mobile/android` / `ios`; policy not locked | Decide **commit vs ignore** `apps/mobile` native dirs and align ignore rules                                        |
| **CI**                                        | No **`.github`** in repo (or elsewhere)                             | Any future workflow must **`cd apps/mobile`** or use **`expo prebuild apps/mobile`** / EAS **`--project-dir`**      |
| **EAS**                                       | [`apps/mobile/eas.json`](apps/mobile/eas.json) exists               | Confirm EAS project root is **`apps/mobile`** (default when `eas.json` lives there)                                 |
| **Docs**                                      | Plan file only                                                      | Short **README** note: never prebuild at monorepo root; use root **`pnpm prebuild:mobile:clean`** or explicit path  |
| **Optional scripts** (from reference snippet) | Not in [`apps/mobile/package.json`](apps/mobile/package.json)       | **`expo export --output-dir ./build`**, **`eas-build-post-install`**, **`lint`/`test`** — add only if you need them |

**Operational note:** While **`android`/`ios` exist only at the root** and **`pnpm ios` / `pnpm android`** run with cwd **`apps/mobile`**, Expo may still be inconsistent or confusing (wrong tree opened in Android Studio / Xcode). Completing the move removes that ambiguity.
