# feat-0016: Tech Spec — Tour & Tutorial

## Context

See [`PRODUCT.md`](./PRODUCT.md) for UX, Figma nodes, and step copy. This document maps implementation to Troott web files, selectors, and APIs.

## Entry and routing

| Surface | Current | Target |
| ------- | ------- | ------ |
| `/get-started/tour-guide` | [`TourGuidePage.tsx`](../../../../apps/web/src/app/get-started/TourGuidePage.tsx) placeholder | **Launcher**: copy + **Start tour** → `/dashboard? tour=1` |
| Dashboard | No tour | [`TourProvider`](../../../../apps/web/src/components/shared/tour/TourProvider.tsx) reads query or session flag |
| Footer **Continue** | [`ProgressButtons`](../../../../apps/web/src/components/shared/get-started/ProgressButtons.tsx) calls `onboardingTourComplete` | Keep for users who skip interactive tour; disable duplicate if tour completed in session |

```text
/get-started/tour-guide     → TourGuidePage (launcher)
/dashboard                  → Home + TourProvider (steps 1–5)
```

## Proposed file map

| Concern | Path |
| ------- | ---- |
| Orchestrator | `apps/web/src/components/shared/tour/TourProvider.tsx` |
| Popover shell | `apps/web/src/components/shared/tour/TourStepPopover.tsx` |
| Overlay + spotlight | `apps/web/src/components/shared/tour/TourOverlay.tsx` |
| Step config | `apps/web/src/components/shared/tour/tour-steps.ts` |
| Launcher UI | `apps/web/src/app/get-started/TourGuidePage.tsx` |
| Dashboard hook-in | `apps/web/src/app/dashboard/Dashboard.tsx` (wrap or mount provider) |
| Sidebar targets | `apps/web/src/components/shared/navigation/Sidebar.tsx` — `data-tour="nav-dashboard"` etc. |
| API | Existing [`api.minister.onboardingTourComplete`](../../../../apps/web/src/api/clients/minister.ts) / creator mirror |
| Checkpoint (legacy) | [`get-started-checkpoint.ts`](../../../../apps/web/src/services/get-started-checkpoint.ts) `/get-started/tour-guide` |

## Step configuration (`tour-steps.ts`)

```typescript
export type TourStepId =
  | 'upload-from-computer'
  | 'sidebar-dashboard'
  | 'sidebar-sermons'
  | 'sidebar-analytics'
  | 'your-feed';

export interface TourStepConfig {
  id: TourStepId;
  route: '/dashboard' | '/sermons' | '/analytics';
  target: string; // data-tour selector
  title: string;
  body: string;
  placement: 'top' | 'right' | 'bottom';
  showPrevious: boolean;
  primaryLabel: 'Next' | 'Finish';
}
```

| Step | `target` selector | `route` |
| ---- | ----------------- | ------- |
| 1 | `[data-tour="upload-from-computer"]` | `/dashboard` |
| 2 | `[data-tour="nav-dashboard"]` | `/dashboard` |
| 3 | `[data-tour="nav-sermons"]` | `/dashboard` (v1; optional `/sermons` on enter) |
| 4 | `[data-tour="nav-analytics"]` | `/dashboard` |
| 5 | `[data-tour="your-feeds"]` | `/dashboard` |

Copy strings: PRODUCT.md (Figma verbatim).

## Popover implementation (Origin hybrid)

Base: shadcn [`Popover`](../../../../apps/web/src/components/ui/popover.tsx) **controlled** — open while tour active; position via `@floating-ui/react` or Radix anchor rect from spotlight target.

Structure (matches Figma `3815:958`):

```tsx
<Popover open={active}>
  <PopoverAnchor virtualRef={targetRef} />
  <PopoverContent className="w-[381px] border-[#405e5e] bg-[#333234] p-4">
    {/* badge + Skip */}
    {/* title + body */}
    {/* footer: Previous | Next/Finish | n of 5 */}
  </PopoverContent>
</Popover>
```

Origin UI **onboarding-tour** / **popover-05** patterns: copy into `TourStepPopover.tsx`; map Troott tokens (same as document modal `#333234`, CTA `#08ffdb`).

**Do not** add `@coss/ui` or Base UI for v1.

## Overlay + spotlight

Options (pick one in implementation PR):

| Option | Pros | Cons |
| ------ | ---- | ---- |
| **A. Custom fixed div + SVG mask** | No deps; full control | Must handle scroll/resize |
| **B. `@reactour/tour`** | Spotlight + steps built-in | Style override to match Figma |
| **C. `driver.js`** | Lightweight highlight | Popover styling separate |

Recommended: **A** for v1 if ≤5 fixed targets on dashboard layout; **B** if resize bugs block release.

Spotlight: match Figma white/teal outline on target; `pointer-events: none` on overlay except popover.

## State machine

```text
idle → active(step=0) → … → active(step=4) → completing → idle
                    ↘ skipped ───────────────→ completing
```

- Persist `sessionStorage.troott.tour.dismissed` optional to avoid re-show same session.
- Do **not** use `localStorage.onboarding_progress` for tour step index.

## API + hub sync

On **Finish** or **Skip**:

```typescript
await api.minister.onboardingTourComplete({}); // or creator
dispatchOnboardingProfileRefresh();
navigate(PATH_GET_STARTED);
```

Same pattern as [feat-0015](../feat-0015/TECH.md). Hub reads `onboarding.step ≥ 5` → **3/4**.

## Integration with Get Started

| Hub item | Server step | After feat-0016 |
| -------- | ----------- | --------------- |
| 3 — How to use troott | ≥ 5 | Completed after tour Finish/Skip |

Replace feat-0010 placeholder acceptance:

- Remove “full interactive tour deferred” from feat-0010 when feat-0016 ships.

## Accessibility

- Popover: `role="dialog"`, `aria-labelledby` / `aria-describedby`
- Step counter: `aria-live="polite"` on change
- Skip: confirm dialog (shadcn AlertDialog) optional v1.1
- Focus trap inside popover while step active

## Testing

| Case | Expected |
| ---- | -------- |
| Start from tour-guide | Dashboard mounts, step 1 visible |
| Next through 5 | Counter 1→5, Finish on last |
| Previous from step 3 | Step 2, counter updates |
| Skip | API called, hub 3/4 if eligible |
| Already step ≥ 5 | Skip tour launcher; hub shows Completed |
| Missing target node | Fail safe: toast + abort tour |

## Figma assets

Export PNGs into [`assets/`](./assets/) per [`assets/README.md`](./assets/README.md) (pacepard `export_node_as_image`).

## Checklist (implementation)

- [ ] `tour-steps.ts` + selectors on dashboard/sidebar
- [ ] `TourProvider` + overlay + popover
- [ ] `TourGuidePage` launcher
- [ ] Wire Finish/Skip → tour-complete
- [ ] Hub refresh → 3/4
- [ ] Manual QA against Figma screenshots
- [ ] Update feat-0010 deferred section → link feat-0016
