# Tip a Vet — Multi-Page Expansion Design

## Overview

This expands the existing "Tip a Vet" MVP (currently built on the
`worktree-tip-a-vet-mvp` branch, not yet merged to `master`) from a
two-view directory/profile app into a multi-page pitch mockup with a home
page, site-wide navigation, a dedicated payment/checkout page, a form to
submit a new veteran, and a page of past veterans the (fictional) nonprofit
has served.

This remains a **concept/pitch mockup**, per the original design
(`docs/superpowers/specs/2026-07-20-tip-a-vet-design.md`): no real nonprofit
entity, no real payment processor, no persistence backend, fictional seed
data only. Nothing in this expansion changes that framing.

## Prerequisite: merge existing MVP

The `worktree-tip-a-vet-mvp` branch (`index.html`, `styles.css`, `data.js`,
`app.js` — directory grid, hash router, veteran profile, inline tip flow)
must be merged into `master` before this expansion's implementation plan
begins. This design builds on top of that code rather than starting over.

## Scope

In scope:
- Home page with nonprofit mission messaging (who we help — veterans at
  risk and veterans in general — and how tips help)
- Site-wide navigation menu (Home, Browse Vets, Submit a Vet, Past Vets
  Served) present on every page
- A persistent "Tip a Vet a Buck" quick-donate button in the header/nav and
  on the home page hero
- A dedicated payment/checkout page (full mock checkout UI), replacing the
  old inline tip flow on the profile page
- "Submit a Vet" form that adds a new fictional veteran to the live
  directory (in-memory)
- "Past Vets Served" page: a separate, static list of fictional veterans
  the nonprofit has already fully supported
- Illustrated, deterministic, non-photographic avatar generation per
  veteran (replacing initials-only avatars)

Out of scope (unchanged from original spec, still applies):
- Real payment processing (e.g. Stripe) — all card fields are visual only,
  never transmitted
- Backend/persistence layer — all new data (submitted vets, tips) is
  in-memory and resets on reload
- Real veteran photos or names — avatars remain synthetic/illustrated, not
  photos of real identifiable people
- Automated test suite
- Account/auth system, admin moderation queue for submissions

## Architecture & Stack

Unchanged foundations: plain HTML + CSS + vanilla JavaScript, no framework,
no build tools, no npm dependencies, must run by opening `index.html`
directly via `file://` (so no ES modules — plain `<script>` tags, global
scope), hash-based routing.

Given the app roughly triples in surface area, the monolithic `app.js` is
split into per-view files, each loaded via its own `<script>` tag in
`index.html`, each exposing one `renderX()` entry point consumed by the
router:

- `data.js` — `VETERANS`, `SERVED_VETERANS`, `TIPS` arrays + shared helpers
  (`formatCurrency`, `findVeteran`)
- `avatars.js` — deterministic illustrated-avatar SVG generator
- `router.js` — hash-based route table and `showView`/navigation helpers
- `view-home.js` — `renderHome()`
- `view-directory.js` — `renderDirectory()`
- `view-profile.js` — `renderProfile(vet)`
- `view-payment.js` — `renderPayment(vet | null)` (handles both `#/tip` and
  `#/tip/:id`)
- `view-submit.js` — `renderSubmitForm()`
- `view-served.js` — `renderServedVets()`
- `app.js` — DOMContentLoaded wiring only (script includes, initial route)

## Routes

| Hash | View | Notes |
|---|---|---|
| `#/` | Home | Mission statement, quick-tip button, featured vets preview |
| `#/vets` | Directory | Existing grid, moved off root |
| `#/vets/:id` | Profile | Existing bio view; "Send a tip" button now links to `#/tip/:id` |
| `#/tip` | Payment (quick tip) | Pre-loads a random vet from `VETERANS`, amount pre-filled `$1` |
| `#/tip/:id` | Payment (specific vet) | Amount defaults to preset buttons, no pre-fill |
| `#/submit` | Submit a Vet | Form → appends to `VETERANS` |
| `#/served` | Past Vets Served | Renders `SERVED_VETERANS`, read-only |

Unmatched hashes fall back to the directory view (existing behavior).

## Data Model Additions

```js
// Existing Veteran object gains no new required fields.
// Avatars are now derived, not stored: avatarInitials still kept as a
// fallback/seed for avatar generation, not rendered directly as text.

// New: served (past) veteran — separate list, not derived from VETERANS
{
  id: "s1",
  name: "Harold 'Hal' Whitfield",
  branch: "Navy",
  era: "Vietnam",
  outcomeBlurb: "Fully funded new hearing aids after his benefits lapsed.",
  totalRaised: 340,      // final total, frozen — no longer changes
}
```

Submitted vets (via the Submit a Vet form) are plain `Veteran` objects
appended to `VETERANS` with `totalTipped: 0` and an auto-generated `id`
(e.g. `"v" + (VETERANS.length + 1)`).

## Home Page

- Header/nav (shared across all pages)
- Hero: headline + 1-2 sentence mission statement covering (a) we're a
  nonprofit, (b) we support veterans at risk (homelessness, benefits gaps,
  isolation) and veterans generally, (c) 100% of tips go directly to a vet
  — plus the "Tip a Vet a Buck" button (routes to `#/tip`)
- "How it works" — 3 short steps (Browse a vet → Send a tip → It goes
  straight to them)
- Featured vets strip: 3 vet cards pulled from `VETERANS`, linking to
  `#/vets` ("See all vets")

## Payment Page (`#/tip`, `#/tip/:id`)

Single `renderPayment(vet)` view handling both entry points:
- If arrived via `#/tip` (no id): pick a random veteran from `VETERANS`,
  amount pre-selected to `$1`
- If arrived via `#/tip/:id`: load that veteran, no amount pre-selected
  (matches existing preset-button behavior)
- Shows: veteran's avatar/name/branch/era for context, preset amount
  buttons ($1/$5/$10/$20) + custom amount input (reused from existing tip
  flow logic), donor name field, mock card fields (card number, expiry,
  CVC — client-side formatted/validated for realism, never sent anywhere),
  "Pay" button
- On submit: updates `totalTipped` in memory (same `sendTip` logic as
  today), replaces the form with a "Payment successful — thank you!"
  confirmation and a link back to the vet's profile or directory

This replaces the old inline tip flow embedded directly in the profile
view; the profile's "Send a tip" button becomes a link to `#/tip/:id`
instead of revealing an inline panel.

## Submit a Vet (`#/submit`)

Form fields: name, branch (select: Army/Navy/Air Force/Marines/Coast
Guard), era (text), short bio/story (textarea). Client-side required-field
validation only. On submit:
- Builds a new `Veteran` object (`totalTipped: 0`, auto id, avatar derived
  from name via `avatars.js`)
- Pushes to `VETERANS`
- Shows an inline success message ("Thanks — [Name] is now listed!") with a
  link to their new profile
- In-memory only; resets on reload like everything else

## Past Vets Served (`#/served`)

Read-only card grid rendering `SERVED_VETERANS` (4 fictional entries,
seeded like `VETERANS`). Each card: avatar, name, branch/era,
`outcomeBlurb`, `totalRaised`. No interactivity — no click-through profile,
no further tipping (they've already been fully supported). Purely
demonstrates impact for the pitch.

## Avatars

Real, identifiable stock photos are avoided (pairing an actual person's
photo with an invented at-risk-veteran backstory is the same
misrepresentation concern the original spec ruled out for names). Instead,
`avatars.js` generates a **deterministic illustrated headshot as inline
SVG**, seeded from the veteran's `id` (or generated name for new
submissions): a simple layered SVG (skin tone, hair style/color, simple
facial features) selected via a seeded pseudo-random function so the same
vet always renders the same avatar, with no network fetch and no external
asset files — keeping the `file://`, no-build-tool constraint intact. Used
everywhere an avatar appears: directory cards, profile, payment page,
served-vets page, home page featured strip.

## Navigation

Persistent header across all views: logo/site name (links to `#/`), nav
links (Browse Vets → `#/vets`, Submit a Vet → `#/submit`, Past Vets Served
→ `#/served`), and the "Tip a Vet a Buck" button (→ `#/tip`) styled
distinctly (gold/accent) so it stands out from the nav links. Collapses to
a simple stacked/hamburger layout under a mobile breakpoint.

## Testing

None (unchanged) — manual verification by clicking through each route in a
browser, per the existing project convention.

## Explicitly Out of Scope / Future Phases

- Real payment processor integration
- Backend/persistence layer, submission moderation/review queue
- Veteran-facing dashboard (still deferred from the original spec)
- Public tip activity feed across all veterans
- Real veteran photos/names
- Automated tests
