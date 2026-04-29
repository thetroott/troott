# Onboarding (listener taste and pre–Home)

**Master journey:** [`specs/api/mobile-flow.md`](../api/mobile-flow.md) — User states (§0), verified-not-onboarded entry (§3), onboarding flow (§4C), pre-Home (§4D), interruptions (§7), feedback (§9).

**Scope (UX only):** What the user sees and does after **account activation** (or equivalent) and **before** the main **Home** shell is shown consistently. No guest account: onboarding runs only for **signed-in** users who have not completed required steps.

**Pending deep link:** If the user arrived via a stable share URL before sign-in, the client should keep the target through onboarding and open it when onboarding completes (see [`specs/api/deep-links.md`](../api/deep-links.md)).

---

## Product goal

Collect **favorite ministers** and **favorite topics** (taste) so Home and discovery feel relevant. Optional later steps (photo, notification permission) must be labeled **Required** vs **Optional** with explicit skip outcomes.

---

## When onboarding appears

| Situation | User sees |
|-----------|-----------|
| First sign-in after activation, taste incomplete | First onboarding step (ministers), not Home |
| App reopened, taste still incomplete | **Same step** with selections restored (local + server sync per product) |
| Taste complete | Skip onboarding; go to pre-Home or Home per product |
| Deep link while not onboarded | Either **onboarding first** or **one-off listen then gate Home** — pick one policy globally (see master doc §11 item 1) |

---

## Step 1 — Favorite ministers

### Layout

- Title + short value prop (“Who do you want to hear from?”).  
- **Search** field with clear button; list or grid of ministers with select affordance (checkmark, filled chip, or border).  
- **Selected strip** (horizontal chips) optional for many selections.

### Interactions

- **Tap** toggles select; immediate visual feedback.  
- **Search:** debounced query; **empty state** “No matches”; clearing search restores full list.  
- **Next** primary CTA: **disabled** until minimum count met *or* enabled with inline error on tap — one pattern only.  
- **Back:** If this is first step, back may go to **Sign out** or **Help** only, or block OS back — product decision.  
- **Loading:** skeleton list; error state with **Retry**.

### Errors

- Network failure: non-blaming copy + **Retry**; preserve typed search query.  
- Double tap Next: ignored while submitting.

---

## Step 2 — Favorite topics

### Layout

- Same information hierarchy as step 1 for consistency.  
- Topics as **chips** or list rows; multi-select.

### Interactions

- **Back** to ministers: **selections on both steps preserved**.  
- **Next** or **Finish:** validates minimum topic selections if required.  
- **Skip** only if product allows — must show **consequence** (“Recommendations may be generic”) and optional reminder on Home. If skip is **not** allowed, hide Skip entirely.

### Completion

- Success: brief **confirmation** (checkmark / animation) then **Pre-Home** (§4D in master doc) or direct **Home**.  
- Failure on submit: inline or toast + **Retry**; do not wipe selections.

---

## Pre-Home (transition)

After onboarding submit, user may see **“Setting things up…”**:

- Prefer **progress** or **skeleton** over bare spinner if wait > ~2s.  
- **Failure:** “Couldn’t finish” + **Retry** + optional support.  
- **Leave app:** on return, **auto-retry once** then show error UI if still failing.

---

## Interruptions and resume

| Situation | Expected UX |
|-----------|----------------|
| App backgrounded mid-step | Return to **same step**, same selections |
| Process killed | Resume same step if persisted; else restart step 1 with warning only if data lost |
| User taps Sign out from onboarding | Confirm; clears progress per product rules |

---

## Accessibility and localization

- Screen reader order: title → helper text → search → list → primary CTA.  
- Minimum touch targets 44pt for chips and list rows.  
- RTL: chip row and back arrow mirror correctly.

---

## Engineering handoff (non-UX)

Preference persistence and “can enter Home” flags are defined in API/mobile modules; keep UX copy and gates aligned with a **single** server-driven rule (master doc §11 item 2).

---

## Revision history

- **2026-04-14:** Populated from `mobile-flow.md`; scoped to taste + pre-Home listener experience.
