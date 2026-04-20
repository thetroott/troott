# Web product flows (API-facing product specs)

This file is the **entry point for web** experience documentation in `specs/api/`. It does not duplicate every interaction; it orients readers and links to the detailed flow docs.

## What lives here

| Document | Audience | Focus |
|----------|----------|--------|
| **[minister-flow.md](./minister-flow.md)** | Ministers (creators) on **web** | Full **user interaction** spec: creator mode, upload, draft, review, publish, manage sermons, bulk actions, interruptions—**no backend detail**. YouTube Studio–style depth. |
| **[mobile-flow.md](./mobile-flow.md)** | Listeners on **mobile** | Registration, taste onboarding, discovery, playback, library, playlists—aligned with the mobile app. |

## Web vs mobile

- **Web (this tree):** Minister / creator workflows—large screens, drag-and-drop, multi-tab sessions, dashboard lists, bulk select.
- **Mobile:** Primarily listener consumption; minister tooling may be minimal or absent on small screens.

## “Successful publish” (minister, web)

From the user’s point of view: they finish **Review** → confirm **Publish** → see **success** → the sermon appears as **Published** (or **Scheduled**) in the dashboard and can be **shared** or **edited** per [minister-flow.md](./minister-flow.md) section 1.2 and section 4.G.

## Where to go next

- **Designing or QA’ing the minister web studio:** read [minister-flow.md](./minister-flow.md) end to end, especially **§0 Creator states**, **§4 Step-by-step**, **§5 Manage sermons**, and **§7–8 Interruption / edge cases**.

If you add a **separate web listener** or **admin web** spec, register it in the table above and keep one paragraph here describing scope.
