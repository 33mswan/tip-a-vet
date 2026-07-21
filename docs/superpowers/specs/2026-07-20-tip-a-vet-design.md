# Tip a Vet — Design

## Overview

"Tip a Vet" is a donor-facing web app for tipping veterans, modeled after the
simplicity of sending money on Venmo. Donors browse a directory of veteran
profiles and send a tip (in dollars, informally called "bucks" — tagline:
**"Tip a Vet a Buck"**). This is the MVP: only the donor-facing flow. A
veteran-facing dashboard/payout feed (where a vet sees incoming tips
accumulate like a Venmo activity feed) is an explicit future phase, not built
now.

**Purpose note:** this build is a concept mockup/prototype used to pitch the
idea to a stakeholder (via screenshots), not a live public product. There is
no real nonprofit entity or payment processor behind it yet, so no real-money
handling, charitable-solicitation, or tax-exempt-status concerns apply at
this stage — the simulated data and lack of payment integration described
below are intentional for that reason, not just a build shortcut.

## Scope (MVP)

In scope:
- Veteran directory (browse/list)
- Veteran profile view
- Tip flow: preset dollar amounts + custom amount, confirm, success state
- Running "total tipped" displayed per veteran
- Fictional seed data only — no real people's names or photos

Out of scope (future phases):
- Veteran-facing dashboard/balance feed
- Real payment processing (e.g. Stripe)
- Persistence backend or database (data resets on page reload)
- Public activity feed of recent tips across all veterans
- Automated test suite

## Architecture & Stack

- Plain **HTML + CSS + vanilla JavaScript** — no framework, no TypeScript, no
  build tools, no npm dependencies. Open `index.html` directly in a browser.
- Single `index.html` with JS-driven view switching between the directory and
  a veteran's profile (a lightweight hand-rolled SPA), using hash-based
  navigation (e.g. `#/vets/v1`) so a specific veteran's profile is a
  shareable/bookmarkable link, and the browser back/forward buttons work.
- Veterans and tips live in an in-memory JS array (module-level state). No
  `localStorage`, no server — a page reload resets all tip totals back to the
  seed values.
- No real payment integration anywhere; tipping is fully simulated.

## Data Model

Plain JS objects, no schema/types enforced beyond convention:

```js
// Veteran
{
  id: "v1",
  name: "James 'Jimmy' Doyle",
  branch: "Army",       // Army | Navy | Air Force | Marines | Coast Guard
  era: "WWII",           // e.g. "WWII", "Vietnam", "Gulf War"
  bio: "Short fictional bio...",
  avatarInitials: "JD",  // generic placeholder, no photo
  totalTipped: 0,        // dollars
}

// Tip
{
  id: "t1",
  veteranId: "v1",
  amount: 5,              // dollars
  timestamp: "2026-07-20T18:00:00.000Z",
}
```

Seed data: 6–8 fictional veteran profiles spanning different eras/branches,
with initials-based avatar placeholders (no photos). Names and bios are
invented, not based on real people.

## Pages & Flow

1. **Directory (`#/`)** — grid of veteran cards: avatar (initials), name,
   branch/era, total tipped so far. Clicking a card navigates to that
   veteran's profile.
2. **Profile (`#/vets/:id`)** — full bio, branch/era, total tipped, and a
   "Send a tip" button that reveals the tip flow inline on the same view (no
   extra navigation/route).
3. **Tip flow (inline on profile)** — preset dollar-amount buttons ($1 / $5 /
   $10 / $20) plus a custom-amount input, and a "Confirm" button. On confirm:
   a brief "Tip sent!" success message appears, the veteran's `totalTipped`
   updates immediately in the UI, and a new `Tip` record is added to
   in-memory state.

## Visual Style

Patriotic/military-inspired palette — navy, gold/brass accent, deep red — on
a clean, card-based layout. Tagline displayed prominently: **"Tip a Vet a
Buck."**

## Testing

None for this MVP. Verification is manual: open `index.html` in a browser
and click through the directory → profile → tip flow.

## Explicitly Out of Scope / Future Phases

- Veteran-facing balance/payout dashboard (a Venmo-style feed showing a vet
  their incoming tips over time)
- Real payment processor integration
- Backend/persistence layer (database, server, `localStorage`)
- Public tip activity feed across all veterans
- Real veteran photos/names — the user may substitute their own sourced,
  rights-cleared content later
- Automated tests
