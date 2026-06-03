# feat-0031 TECH — Upload sermon hub CTA

## File map

| Area | Path | Role today |
| ---- | ---- | ---------- |
| Hub UI | `apps/web/src/app/get-started/GetStarted.tsx` | `navigateToHubItem`; item 3 special-case; item 4 plain `navigate` |
| Hub data | `apps/web/src/_data/onboarding.tsx` | `studioPath(PATH_SEG_SERMONS_UPLOAD)` |
| Studio code helper | `apps/web/src/utils/studio-nav.util.ts` | `getStoredStudioCode`, `studioUploadPath` |
| Onboarding gates | `apps/web/src/utils/hub-onboarding.util.ts` | `canAccessStudioDuringOnboarding`, `resolveOnboardingStep`, `shouldRedirectStudioNavForOnboarding` |
| Studio shell | `apps/web/src/app/studio/StudioPortal.tsx` | Redirect incomplete onboarding away from upload |
| Upload host | `apps/web/src/app/studio/SermonUploadPage.tsx` | Wizard + entry modal |
| Tour checkpoint | `apps/web/src/services/get-started-checkpoint.ts` | `onboardingTourComplete` at `/get-started/tour-guide` |
| Sidebar (reference) | `apps/web/src/components/shared/navigation/Sidebar.tsx` | Uses `shouldRedirectStudioNavForOnboarding` — hub should match |

## Root cause analysis (blink)

### Primary: studio guard redirect loop

[`StudioPortal.tsx`](../../../../apps/web/src/app/studio/StudioPortal.tsx) (lines ~76–91):

```ts
if (!isStudioOnboardingComplete(...) && !partialStudioAccess) {
    navigate(PATH_GET_STARTED, { replace: true });
}
```

[`canAccessStudioDuringOnboarding`](../../../../apps/web/src/utils/hub-onboarding.util.ts):

```ts
if (step >= ONBOARDING_STEP_TOUR && isStudioUploadNavHref(pathOnly)) {
    return true;
}
```

Upload hrefs are allowed only when **`step >= 5`**. Hub **does not** check this before `navigate`, so `step === 4` produces:

`/get-started` → `/studio/{code}/sermons/upload` → **immediate** `/get-started` = blink.

**Fix:** Add preflight in `navigateToHubItem` (or shared `launchUploadFromGetStartedHub()`) before `navigate`.

### Secondary: placeholder studio code `_`

[`onboarding.tsx`](../../../../apps/web/src/_data/onboarding.tsx) `studioPath`:

```ts
if (!code) return `${PATH_STUDIO_PREFIX}/_/${segment}`;
```

Hub navigates to invalid code; `api.studio.getStudio('_')` errors → empty/error state or redirect.

**Fix:** Block navigation; toast (mirror item 3); optionally hydrate code from `api.studios.me` / session.

### Tertiary: accordion UX

Collapsed **Upload sermon** uses `e.stopPropagation()` then `navigateToHubItem`. If navigation is blocked silently, user may only see accordion trigger flash. Less common once F1/F2 show toasts.

### Not the cause (usually)

- `GetStartedOnboardingGate` — redirects **away** from get-started when onboarding **complete**; opposite of blink on upload.
- `UploadModal` not opening — only relevant after successful route to `SermonUploadPage`.

## Implementation (shipped)

Direct preflight in [`GetStarted.tsx`](../../../../apps/web/src/app/get-started/GetStarted.tsx) `navigateToHubItem` for `item.id === '4'`: block when `onboardingStep < ONBOARDING_STEP_TOUR`, block when no studio code (toast), else `navigate(studioUploadPath(code, PATH_SEG_SERMONS_UPLOAD))`. No new helpers.

## Recommended implementation (superseded — do not add helpers)

### 1. `launchUploadFromGetStartedHub` in `hub-onboarding.util.ts`

```ts
export type UploadHubLaunchResult =
  | { ok: true; href: string }
  | { ok: false; reason: 'tour' | 'studio' | 'complete' };

export function resolveUploadHubLaunchHref(
  studioCode: string,
): string {
  return studioUploadPath(
    normalizeStudioCode(studioCode),
    PATH_SEG_SERMONS_UPLOAD, // or PATH_SEG_SERMONS_UPLOAD_FILE
  );
}

export function launchUploadFromGetStartedHub(params: {
  userType: string;
  minister: MinisterResponseDTO | null | undefined;
  creator: CreatorResponseDTO | null | undefined;
  user: { onboard?: { step?: number; status?: string }; studioCode?: string | null } | null;
  studioCodeFromContext?: string | null;
}): UploadHubLaunchResult
```

Logic:

1. `step = resolveOnboardingStep(...)`
2. If `step >= ONBOARDING_STEP_FIRST_SERMON` → `{ ok: false, reason: 'complete' }` (hub already disables — belt-and-suspenders)
3. If `step < ONBOARDING_STEP_TOUR` → `{ ok: false, reason: 'tour' }`
4. `code = pickSidebarStudioCode({ sessionCode: user?.studioCode, storedCode: getStoredStudioCode(), contextCode: studioCodeFromContext })`
5. If `!code` → `{ ok: false, reason: 'studio' }`
6. `href = resolveUploadHubLaunchHref(code)`
7. If `!canAccessStudioDuringOnboarding(href, ...)` → map to `tour` or `studio` (defensive)
8. `{ ok: true, href }`

### 2. Wire `GetStarted.tsx`

```ts
const navigateToHubItem = (item) => {
  if (item.id === '3') { /* existing tour */ }
  if (item.id === '4') {
    const result = launchUploadFromGetStartedHub({ ... });
    if (!result.ok) {
      if (result.reason === 'tour') toast.error(TOUR_FIRST_MSG);
      if (result.reason === 'studio') toast.error(STUDIO_NOT_READY_MSG);
      return;
    }
    navigate(result.href);
    return;
  }
  navigate(item.action);
};
```

### 3. Remove `_` placeholder from hub navigation paths (optional hardening)

Change `studioPath` in `onboarding.tsx` to return `null` when no code; hub handles null via preflight. **Or** keep placeholder but never navigate to it after preflight.

### 4. Tests

Extend `hub-onboarding.util.test.ts`:

- `launchUploadFromGetStartedHub` step 4 → `tour`
- step 5 + code → `ok` + href contains code, not `_`
- step 6 → `complete`

### 5. QA verification

Repro before fix:

1. Minister `onboarding.step = 4` on network tab.
2. Click **Upload sermon** → observe brief `/studio/.../upload` then `/get-started`.

After fix: toast on step 4; stable upload page on step 5.

## Dependency on other features

| Feature | Interaction |
| ------- | ----------- |
| feat-0016 | Tour Finish / tour-guide **Continue** must set `step >= 5` |
| feat-0030 | Completed users leave hub — item 4 disabled |
| feat-0009 | Studio code cached after `GET /studios/me` |

## Out of scope for this TECH pass

- Changing `canAccessStudioDuringOnboarding` thresholds (keep `step >= 5` for upload).
- Opening upload modal inside Get Started layout (still studio route).
