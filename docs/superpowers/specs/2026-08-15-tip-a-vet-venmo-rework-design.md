# Tip a Vet — Venmo-Style Rework Design

## Overview

The current build (see `2026-07-20-tip-a-vet-design.md` and
`2026-07-23-tip-a-vet-expansion-design.md`) reads as a nonprofit/charity
donation site: navy/gold/red patriotic palette, formal card-based layout,
a full checkout form (name on card, card number, expiry, CVC), and copy
built around "nonprofit," "donors," and "gift."

This rework keeps the app a concept/pitch mockup (no real nonprofit entity,
no real payment processor, no persistence backend — unchanged from prior
specs) but reworks its **visual design, component style, copy/tone, and
payment flow** so it reads and feels like a peer-to-peer payment app
(Venmo) that happens to be for tipping veterans, rather than a charity
donation site — while keeping a patriotic identity that's muted/faded
rather than bold/graphic.

This is a styling, copy, and payment-flow-layout change only. Data model,
routing (`router.js`), and in-memory-only behavior are unchanged. No new
pages or features.

## Visual System

**Palette** — replaces the current navy/gold/red patriotic palette,
inspired by a reference photo of a folded American flag (deep navy,
aged-cream stars/stripes, warm brick-red, warm directional lighting) but
desaturated/muted for a subtle, premium feel rather than a bold graphic
flag:

```css
--color-bg:      #F6F1E6;  /* warm cream background, not stark white */
--color-navy:    #28394F;  /* primary — headers, nav, primary buttons, text on light */
--color-red:     #A8483F;  /* accent — CTAs, "sent" states, highlights — kept vivid, not grayed down */
--color-tan:     #CBB894;  /* supporting neutral — dividers, secondary borders */
--color-green:   #00C853;  /* money-green — success checkmarks/badges only, small & functional */
--color-text:    #1A1A1A;
--color-text-secondary: #6B7280;
```

The red accent stays at real strength for contrast/personality against the
cream — "muted" applies to the navy and overall saturation, not to
draining all color out.

**Texture** — a very low-opacity (~4–6%) faded flag-fabric texture
(soft fabric folds, not a stars/stripes graphic) as a background wash
behind the home page hero section only. Everywhere else stays flat/clean
so texture doesn't hurt legibility.

**Personality accent** — a small recurring star motif used sparingly:
a star next to the "Tip a Vet" wordmark in the header, star bullets in the
home page "how it works" steps, a thin star-divider under the header. This
carries the patriotic identity without relying on bold flag colors.

**Typography** — swap the current system-serif-adjacent stack for a
rounded, friendly sans (`"Inter", "Nunito", system-ui, sans-serif`).
Dollar amounts get extra-bold weight and a notably larger size than body
text wherever they appear (directory/profile totals, and especially the
payment amount display).

**Components:**
- Buttons: full pill shape, bold, solid navy or red fill (no outline
  style), no borders
- Cards (`veteran-card`, `profile-content`, etc.): drop the `1px` border,
  use a soft box-shadow instead, increase border-radius (`0.75–1rem`),
  more internal whitespace
- Avatars: keep the existing illustrated-avatar SVG generator
  (`avatars.js`) unchanged — only its layout context changes (see Profile
  below)

## Copy & Tone Rework

Strip nonprofit/charity language site-wide; replace with short, casual,
second-person, peer-to-peer phrasing. No em-dash-heavy "brochure"
sentences.

| Where | Before | After |
|---|---|---|
| Home hero | "Tip a Vet is a nonprofit that connects everyday donors directly with veterans who need support... Every tip goes straight to a real person's story, not overhead." | "Send a vet a few bucks. Straight from you to them — no middleman, just a small processing fee." |
| Home "how it works" step 1 | "Read a short story about a veteran we're supporting." | "Find a vet." |
| Home "how it works" step 3 | "No middlemen, no overhead skimmed off your gift." | "It goes straight to them, minus a small processing fee." |
| Header nav | "Submit a Vet" | "Add a Vet" |
| Header nav | "Past Vets Served" | "Vets We've Tipped" |
| Directory page heading | "Every one of these veterans has a story. Pick one to learn more and send a tip." | "Pick someone to send a few bucks to." |
| Profile | "Send a tip" button | "Send $" |
| Payment success | "Payment successful! Thanks for tipping [name] $X. Their new total is $Y." | "Sent! 🎉 [Name] just got $X from you." |
| Served page fields/copy | `totalRaised` / "$X raised" | `totalReceived` / "$X received" |
| Submit success | "Thanks — [name] is now listed!" | "Done — [name]'s on the list." |
| General | "donor(s)", "gift" | never used — just "you" / "tip" |

The word "nonprofit" is removed everywhere. "Tip a Vet a Buck" tagline is
kept as-is (already casual/on-brand).

## Payment Flow Rework

The full card-checkout form (name on card, card number, expiry, CVC) is
replaced with a Venmo-style amount-entry screen. No card fields anywhere
— this was always simulated/out-of-scope for real payment processing, and
removing the form fields removes the biggest "checkout" feeling from the
app.

Layout (`view-payment.js`, replaces current `renderPayment`/
`setUpPaymentFlow`):

```
  [avatar]  James "Jimmy" Doyle
            Army · WWII

         $ 5
   (huge, bold, tappable/editable number — click a preset chip
    to fill it, or the number itself is directly editable)

  [$1] [$5] [$10] [$20]        <- pill chips, same preset amounts as today

  You send            $5.00
  Processing fee      +$0.30
  ─────────────────────────
  Total                $5.30

  [ Add a note (optional) ]    <- new: free-text input, not persisted/used elsewhere

     [   Send $5.30   ]        <- pill button, label updates with total
```

**Fee:** flat $0.30 per tip, always shown as a disclosed line item between
the amount and the total. `sendTip()` and the veteran's `totalTipped`
continue to track only the tip amount (not the fee) — the fee is a
display-only line in this mockup, not deducted from `totalTipped`.

On submit: success panel shows "Sent! 🎉 [Name] just got [amount] from
you," followed by "Back to profile" (same pattern as today, just reworded
and restyled to match the flat/card-shadow style).

The `#/tip` (random vet, quick-tip) and `#/tip/:id` (specific vet) routes
and their pre-fill behavior (per the original expansion spec) are
unchanged — only the on-screen content/layout changes.

## Page-by-Page Changes

- **Header/nav** (`index.html`, `styles.css`): stays a navy bar; add a
  small star icon beside the "Tip a Vet" wordmark; nav link labels updated
  per the copy table above.
- **Home** (`view-home.js`): hero copy per table; faded flag-texture
  background wash behind hero only; "how it works" steps get star-bullet
  icons; card/component restyle applies to the featured-vets grid.
- **Directory** (`view-directory.js`): no logic changes; cards adopt the
  flat/shadow style; page heading copy simplified per table.
- **Profile** (`view-profile.js`): avatar + name/branch/era laid out
  left-aligned inline (like a contact row) instead of centered under a
  large avatar; "Send a tip" → "Send $"; card adopts flat/shadow style.
- **Payment** (`view-payment.js`): full rework per Payment Flow section
  above.
- **Add a Vet** (`view-submit.js`): same fields/validation logic
  (name, branch, era, bio); inputs restyled flat/pill; success copy
  simplified per table.
- **Vets We've Tipped** (`view-served.js`, `data.js`): `totalRaised` field
  renamed `totalReceived` throughout (`data.js` seed data and this view);
  display copy "raised" → "received"; cards match new flat style.

## Explicitly Out of Scope

- New features, pages, or routes
- Backend/persistence, real payment processing — still fully simulated
- Changes to the illustrated-avatar generation logic itself
  (`avatars.js`), data model shape beyond the `totalRaised` →
  `totalReceived` rename, or routing behavior
- Automated tests (none exist; none added)

## Testing

Manual only, per prior specs: open `index.html` in a browser and click
through home → directory → profile → payment (with fee line visible) →
success, plus add-a-vet and vets-we've-tipped pages, confirming the new
visual style and copy read consistently and no charity/nonprofit language
remains.
