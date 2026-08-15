# Tip a Vet — Venmo-Style Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework Tip a Vet's visual design, copy, and payment flow so it reads and feels like a peer-to-peer payment app (Venmo) with a muted, flag-inspired patriotic identity, instead of a nonprofit/charity donation site.

**Architecture:** No new pages, routes, or data model shape beyond one field rename. This is a styling + copy + payment-flow-layout rework of the existing plain HTML/CSS/vanilla-JS app (`index.html`, `styles.css`, `data.js`, `avatars.js`, `router.js`, `view-*.js`).

**Tech Stack:** Plain HTML, CSS, vanilla JavaScript (global scope, `<script>` tags, no build step, no npm dependencies, no external fonts/images/CDNs — must keep working when `index.html` is opened directly via `file://`).

## Global Constraints

- No nonprofit/charity language anywhere in the UI: never use "nonprofit," "donor(s)," or "gift." (Spec: Copy & Tone Rework.)
- Palette is fixed: `--color-bg:#F6F1E6` `--color-navy:#28394F` `--color-red:#A8483F` `--color-tan:#CBB894` `--color-green:#00C853`. The red accent stays at full strength (not desaturated). (Spec: Visual System.)
- No external font/image assets — no Google Fonts link, no CDN, no image files. The "faded flag texture" is implemented as a pure-CSS low-opacity striped gradient on the hero section only, not a photo. (Spec: Visual System; this plan's Task 1.)
- Processing fee is a flat **$0.30**, always shown as a disclosed line item, and is *not* added to a veteran's `totalTipped` (fee is display-only). (Spec: Payment Flow Rework.)
- `formatCurrency` must always show two decimal places (e.g. `$5.30`, `$150.00`) — needed for the fee breakdown, applies everywhere the helper is used. (This plan's Task 2.)
- Data model, routing (`router.js`), and `avatars.js` are unchanged except the `SERVED_VETERANS[].totalRaised` → `totalReceived` rename. No new features, no automated test suite (none exists in this codebase; verification is manual/grep-based, consistent with prior specs).

---

## File Structure

| File | Responsibility | Touched by |
|---|---|---|
| `styles.css` | All palette/typography/component/new-payment-UI styles | Task 1 |
| `data.js` | Shared data + helpers (`formatCurrency`, `escapeHtml`, `findVeteran`, `sendTip`), `SERVED_VETERANS` field rename | Task 2 |
| `index.html` | Header/nav copy, star wordmark, page headings/subtext | Task 3 |
| `view-home.js` | Hero + how-it-works copy, star bullets | Task 4 |
| `view-profile.js` | Left-aligned contact-row layout, "Send $" button | Task 5 |
| `view-payment.js` | Full Venmo-style amount-entry + fee + note + send flow | Task 6 |
| `view-submit.js` | Success copy, button label, drop local `escapeHtml` (moved to `data.js`) | Task 7 |
| `view-served.js` | Use renamed `totalReceived` field, "received" copy | Task 8 |

Task 1 (CSS) is a pure styling change and lands first because every later task's markup depends on the class names it defines. Tasks 2–8 can each be verified independently once Task 1 is in place.

---

### Task 1: CSS foundation — palette, typography, components, new payment UI

**Files:**
- Modify: `styles.css` (full-file replace)

**Interfaces:**
- Produces (class names later tasks must use): `.profile-header-row`, `.amount-entry`, `.amount-display`, `.amount-currency`, `.amount-input`, `.amount-chips`, `.amount-chip`, `.amount-chip.selected`, `.fee-breakdown`, `.fee-row`, `.fee-row.fee-total`, `.note-field`, `.brand-star`, `.star-bullet`. Existing class names (`.veteran-card`, `.confirm-button`, `.payment-vet-summary`, `.checkout-form`, `.hero`, `.nav-tip-button`, etc.) keep their names but get new rules.
- Removes dead classes no longer used after Task 6: `.tip-flow`, `.tip-flow-label`, `.amount-options`, `.amount-button`, `.amount-button.selected`, `.custom-amount`, `.custom-amount label`, `.custom-amount input`, `.checkout-row`, `.checkout-row > div`, `.tip-success-message`.

- [ ] **Step 1: Replace the full contents of `styles.css`**

```css
:root {
  --color-bg: #f6f1e6;
  --color-bg-card: #ffffff;
  --color-navy: #28394f;
  --color-navy-dark: #1b2738;
  --color-red: #a8483f;
  --color-red-dark: #8b3a32;
  --color-tan: #cbb894;
  --color-green: #00c853;
  --color-text: #1a1a1a;
  --color-text-secondary: #6b7280;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, "Segoe UI", system-ui, Roboto, sans-serif;
  background-color: var(--color-bg);
  color: var(--color-text);
}

.site-header {
  background-color: var(--color-navy);
  color: var(--color-bg);
  padding: 1.25rem 1rem;
  border-bottom: 3px solid var(--color-red);
}

#app {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.view[hidden] {
  display: none;
}

.veteran-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.veteran-card {
  display: block;
  background-color: var(--color-bg-card);
  border: none;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(40, 57, 79, 0.1);
  padding: 1.5rem;
  text-align: center;
  text-decoration: none;
  color: var(--color-text);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.veteran-card:hover {
  box-shadow: 0 6px 16px rgba(40, 57, 79, 0.16);
  transform: translateY(-2px);
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 1rem;
  flex-shrink: 0;
}

.avatar svg {
  width: 100%;
  height: 100%;
  display: block;
}

.veteran-name {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
  font-weight: 700;
}

.veteran-meta {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.veteran-total {
  color: var(--color-red);
  font-weight: 800;
  font-size: 1.05rem;
}

.back-button {
  background: none;
  border: none;
  color: var(--color-navy);
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  padding: 0;
  font-weight: 600;
}

.back-button:hover {
  text-decoration: underline;
}

.profile-content {
  background-color: var(--color-bg-card);
  border: none;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(40, 57, 79, 0.1);
  padding: 2rem;
  text-align: center;
  max-width: 480px;
  margin: 0 auto;
}

.profile-header-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
  margin-bottom: 1rem;
}

.profile-header-row .avatar-large {
  margin: 0;
}

.profile-header-row .veteran-name,
.profile-header-row .veteran-meta {
  margin-bottom: 0;
}

.avatar-large {
  width: 96px;
  height: 96px;
  font-size: 1.75rem;
}

.veteran-bio {
  margin: 1rem 0;
  line-height: 1.5;
  color: var(--color-text);
  text-align: left;
}

.confirm-button {
  display: block;
  width: 100%;
  background-color: var(--color-red);
  color: var(--color-bg);
  border: none;
  padding: 0.85rem;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: background-color 0.15s ease;
}

.confirm-button:hover {
  background-color: var(--color-red-dark);
}

.confirm-button:disabled {
  background-color: #d8d2c4;
  color: #8a8478;
  cursor: not-allowed;
}

.payment-vet-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.payment-vet-summary .avatar {
  margin: 0;
}

.amount-entry {
  margin-bottom: 1.5rem;
}

.amount-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.15rem;
  margin-bottom: 1.25rem;
}

.amount-currency {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-navy);
}

.amount-input {
  width: 6rem;
  border: none;
  background: none;
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--color-navy);
  text-align: left;
}

.amount-input:focus {
  outline: none;
}

.amount-chips {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.amount-chip {
  border: 2px solid var(--color-navy);
  background-color: transparent;
  color: var(--color-navy);
  padding: 0.5rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
}

.amount-chip.selected {
  background-color: var(--color-navy);
  border-color: var(--color-navy);
  color: var(--color-bg);
}

.fee-breakdown {
  background-color: rgba(203, 184, 148, 0.2);
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  margin-bottom: 1.25rem;
}

.fee-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  padding: 0.2rem 0;
}

.fee-row.fee-total {
  font-weight: 800;
  color: var(--color-text);
  border-top: 1px solid var(--color-tan);
  margin-top: 0.35rem;
  padding-top: 0.5rem;
  font-size: 1rem;
}

.note-field {
  margin-bottom: 0.5rem;
}

.note-field label {
  display: block;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.35rem;
}

.note-field input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-tan);
  border-radius: 0.75rem;
  font-size: 1rem;
  background-color: var(--color-bg);
}

.payment-success-panel {
  text-align: center;
}

.payment-success-panel h2 {
  color: var(--color-navy);
  margin: 1rem 0 0.5rem;
}

.payment-success-panel p {
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.payment-link {
  display: inline-block;
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.checkout-form label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  text-align: left;
}

.checkout-form input,
.checkout-form textarea,
.checkout-form select {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-tan);
  border-radius: 0.75rem;
  font-size: 1rem;
  background-color: var(--color-bg);
  font-family: inherit;
}

.checkout-form textarea {
  resize: vertical;
}

.submit-success {
  text-align: center;
}

.submit-success p {
  margin-bottom: 1rem;
  color: var(--color-navy);
  font-weight: bold;
}

.page-heading {
  text-align: center;
  margin-bottom: 1.5rem;
}

.page-heading h2 {
  color: var(--color-navy);
  margin-bottom: 0.5rem;
}

.served-outcome {
  color: var(--color-text);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.hero {
  position: relative;
  text-align: center;
  padding: 2rem 1rem 3rem;
  border-radius: 1rem;
  background-image: repeating-linear-gradient(
      180deg,
      rgba(168, 72, 63, 0.05) 0px,
      rgba(168, 72, 63, 0.05) 14px,
      rgba(246, 241, 230, 0) 14px,
      rgba(246, 241, 230, 0) 28px
    ),
    linear-gradient(180deg, rgba(40, 57, 79, 0.06), rgba(40, 57, 79, 0));
}

.hero h2 {
  font-size: 1.75rem;
  color: var(--color-navy);
  margin-bottom: 1rem;
}

.hero-copy {
  max-width: 640px;
  margin: 0 auto 1.5rem;
  line-height: 1.6;
  color: var(--color-text);
}

.hero-cta {
  display: inline-block;
  width: auto;
  padding: 0.85rem 2rem;
  font-size: 1.1rem;
}

.how-it-works {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  text-align: center;
}

.how-step h3 {
  color: var(--color-navy);
  margin-bottom: 0.5rem;
}

.star-bullet {
  color: var(--color-red);
  margin-right: 0.35rem;
  font-size: 0.9em;
}

.how-step p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.featured-vets {
  text-align: center;
}

.featured-vets h3 {
  color: var(--color-navy);
  margin-bottom: 1.5rem;
}

.featured-vets .veteran-grid {
  margin-bottom: 1.5rem;
  text-align: left;
}

.see-all-link {
  color: var(--color-navy);
  font-weight: bold;
  text-decoration: none;
}

.see-all-link:hover {
  text-decoration: underline;
}

.header-bar {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.brand {
  text-decoration: none;
  color: var(--color-bg);
  display: flex;
  align-items: center;
}

.brand h1 {
  font-size: 1.5rem;
  letter-spacing: 0.05em;
}

.brand-star {
  color: var(--color-red);
  margin-right: 0.4rem;
}

.nav-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--color-bg);
  font-size: 1.5rem;
  cursor: pointer;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.site-nav a {
  color: var(--color-bg);
  text-decoration: none;
  font-size: 0.95rem;
}

.site-nav a:hover {
  color: var(--color-tan);
}

.nav-tip-button {
  background-color: var(--color-red);
  color: var(--color-bg) !important;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: bold;
}

.nav-tip-button:hover {
  background-color: var(--color-red-dark);
}

@media (max-width: 640px) {
  .nav-toggle {
    display: block;
  }

  .site-nav {
    display: none;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    gap: 1rem;
    margin-top: 1rem;
  }

  .site-nav.open {
    display: flex;
  }
}
```

- [ ] **Step 2: Verify the dead classes and old palette values are gone, and new tokens exist**

Run: `grep -nE "amount-button|tip-flow|custom-amount|checkout-row|color-gold|#0b2545|#c9a35a|#8c1c2c" styles.css`
Expected: no output (nothing matches)

Run: `grep -c "amount-chip\|fee-breakdown\|profile-header-row\|brand-star\|star-bullet" styles.css`
Expected: a number greater than 0

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "Rework palette, typography, and components for Venmo-style look"
```

---

### Task 2: Shared data helpers — `formatCurrency` precision, `escapeHtml` relocation, `totalReceived` rename

**Files:**
- Modify: `data.js`

**Interfaces:**
- Produces: `formatCurrency(amount)` → string with 2 decimals (e.g. `"$5.30"`). `escapeHtml(str)` now defined here (moved from `view-submit.js`), used by `view-submit.js` and `view-payment.js`. `SERVED_VETERANS[].totalReceived` replaces `.totalRaised`.
- Consumes: nothing new.

- [ ] **Step 1: Replace the full contents of `data.js`**

```js
const VETERANS = [
  {
    id: "v1",
    name: "James \"Jimmy\" Doyle",
    branch: "Army",
    era: "WWII",
    bio: "Landed at Normandy with the 29th Infantry Division. After the war, ran a hardware store in his hometown for thirty years and never missed a Memorial Day parade.",
    avatarInitials: "JD",
    totalTipped: 0,
  },
  {
    id: "v2",
    name: "Eleanor Marsh",
    branch: "Navy",
    era: "WWII",
    bio: "Served as a Navy WAVE, decoding communications out of a small office in Washington, D.C. Loved to tell stories about the other women in her unit.",
    avatarInitials: "EM",
    totalTipped: 0,
  },
  {
    id: "v3",
    name: "Robert \"Bobby\" Alvarez",
    branch: "Marines",
    era: "Vietnam",
    bio: "Two tours as a radio operator with the 1st Marine Division. Now volunteers weekly at the local VA hospital, checking in on newer veterans.",
    avatarInitials: "RA",
    totalTipped: 0,
  },
  {
    id: "v4",
    name: "Patricia \"Pat\" Nguyen",
    branch: "Air Force",
    era: "Gulf War",
    bio: "Flew logistics missions during Desert Storm. Studied aerospace engineering afterward and taught high school physics for two decades.",
    avatarInitials: "PN",
    totalTipped: 0,
  },
  {
    id: "v5",
    name: "Walter \"Walt\" Higgins",
    branch: "Army",
    era: "Korea",
    bio: "Fought through the Chosin Reservoir campaign with the 7th Infantry Division. Still meets his old unit for breakfast every first Sunday of the month.",
    avatarInitials: "WH",
    totalTipped: 0,
  },
  {
    id: "v6",
    name: "Diane Okafor",
    branch: "Coast Guard",
    era: "Gulf War",
    bio: "Ran search-and-rescue operations off the Atlantic coast. Now coaches a youth rowing team on weekends.",
    avatarInitials: "DO",
    totalTipped: 0,
  },
];

const TIPS = [];

function escapeHtml(str) {
  var map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  return str.replace(/[&<>"']/g, function (char) {
    return map[char];
  });
}

function formatCurrency(amount) {
  return "$" + amount.toFixed(2);
}

function findVeteran(id) {
  return VETERANS.find(function (v) { return v.id === id; });
}

function sendTip(veteranId, amount) {
  const vet = findVeteran(veteranId);
  vet.totalTipped += amount;
  TIPS.push({
    id: "t" + (TIPS.length + 1),
    veteranId: veteranId,
    amount: amount,
    timestamp: new Date().toISOString(),
  });
  return vet.totalTipped;
}

const SERVED_VETERANS = [
  {
    id: "s1",
    name: "Harold \"Hal\" Whitfield",
    branch: "Navy",
    era: "Vietnam",
    outcomeBlurb: "Fully funded new hearing aids after his VA benefits lapsed.",
    totalReceived: 340,
  },
  {
    id: "s2",
    name: "Marjorie Simms",
    branch: "Army",
    era: "Gulf War",
    outcomeBlurb: "Covered three months of rent during a gap between jobs.",
    totalReceived: 890,
  },
  {
    id: "s3",
    name: "Louis Petrakis",
    branch: "Marines",
    era: "Korea",
    outcomeBlurb: "Funded a wheelchair ramp for his front porch.",
    totalReceived: 615,
  },
  {
    id: "s4",
    name: "Ruth Alden",
    branch: "Air Force",
    era: "WWII",
    outcomeBlurb: "Paid for a headstone marker honoring her service.",
    totalReceived: 275,
  },
];
```

- [ ] **Step 2: Verify the rename and precision change landed**

Run: `grep -n "totalRaised" data.js`
Expected: no output

Run: `grep -n "toFixed(2)" data.js`
Expected: one match, inside `formatCurrency`

- [ ] **Step 3: Commit**

```bash
git add data.js
git commit -m "Rename totalRaised to totalReceived, add 2-decimal currency formatting, relocate escapeHtml"
```

---

### Task 3: Header, nav, and page-heading copy

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `.brand-star` from Task 1.
- Produces: nothing new consumed elsewhere.

- [ ] **Step 1: Update the header brand mark and nav labels**

In the `<header class="site-header">` block, change:

```html
    <a href="#/" class="brand"><h1>Tip a Vet</h1></a>
    <button type="button" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>
    <nav id="site-nav" class="site-nav">
      <a href="#/vets">Browse Vets</a>
      <a href="#/submit">Submit a Vet</a>
      <a href="#/served">Past Vets Served</a>
      <a href="#/tip" class="nav-tip-button">Tip a Vet a Buck</a>
    </nav>
```

to:

```html
    <a href="#/" class="brand"><h1><span class="brand-star">&#9733;</span>Tip a Vet</h1></a>
    <button type="button" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>
    <nav id="site-nav" class="site-nav">
      <a href="#/vets">Browse Vets</a>
      <a href="#/submit">Add a Vet</a>
      <a href="#/served">Vets We've Tipped</a>
      <a href="#/tip" class="nav-tip-button">Tip a Vet a Buck</a>
    </nav>
```

- [ ] **Step 2: Update the directory page-heading paragraph**

Change:

```html
      <p>Every one of these veterans has a story. Pick one to learn more and send a tip.</p>
```

to:

```html
      <p>Pick someone to send a few bucks to.</p>
```

- [ ] **Step 3: Update the submit-view heading**

Change:

```html
    <div class="page-heading">
      <h2>Submit a Veteran</h2>
      <p>Know a veteran who could use support? Tell us about them.</p>
    </div>
```

to:

```html
    <div class="page-heading">
      <h2>Add a Vet</h2>
      <p>Know a vet who deserves a few bucks? Add them to the list.</p>
    </div>
```

- [ ] **Step 4: Update the served-view heading**

Change:

```html
    <div class="page-heading">
      <h2>Veterans We've Served</h2>
      <p>Thanks to donors like you, these veterans have already been fully supported.</p>
    </div>
```

to:

```html
    <div class="page-heading">
      <h2>Vets We've Tipped</h2>
      <p>These vets have already gotten what they needed from people like you.</p>
    </div>
```

- [ ] **Step 5: Verify no charity language or old labels remain**

Run: `grep -niE "nonprofit|donor|Submit a Vet\"|Past Vets Served" index.html`
Expected: no output

Run: `grep -n "brand-star\|Add a Vet\|Vets We've Tipped" index.html`
Expected: matches for all three

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Update header, nav, and page-heading copy to drop charity language"
```

---

### Task 4: Home page copy and star bullets

**Files:**
- Modify: `view-home.js` (full-file replace)

**Interfaces:**
- Consumes: `.hero` (textured background), `.star-bullet` from Task 1; `buildVeteranCard` from `view-directory.js` (unchanged, already global).
- Produces: nothing new consumed elsewhere.

- [ ] **Step 1: Replace the full contents of `view-home.js`**

```js
function renderHome() {
  const container = document.getElementById("home-content");
  const featured = VETERANS.slice(0, 3);

  container.innerHTML =
    '<section class="hero">' +
      '<h2>Every veteran deserves to be seen.</h2>' +
      '<p class="hero-copy">' +
        'Send a vet a few bucks. Straight from you to them &mdash; ' +
        'no middleman, just a small processing fee.' +
      '</p>' +
      '<a href="#/tip" class="confirm-button hero-cta">Tip a Vet a Buck</a>' +
    '</section>' +
    '<section class="how-it-works">' +
      '<div class="how-step">' +
        '<h3><span class="star-bullet">&#9733;</span>Find a vet</h3>' +
        '<p>Browse a few names and pick someone.</p>' +
      '</div>' +
      '<div class="how-step">' +
        '<h3><span class="star-bullet">&#9733;</span>Send a tip</h3>' +
        '<p>Choose an amount, as little as a dollar.</p>' +
      '</div>' +
      '<div class="how-step">' +
        '<h3><span class="star-bullet">&#9733;</span>It goes straight to them</h3>' +
        '<p>Minus a small processing fee.</p>' +
      '</div>' +
    '</section>' +
    '<section class="featured-vets">' +
      '<h3>Meet a few of the vets</h3>' +
      '<div class="veteran-grid" id="featured-grid"></div>' +
      '<a href="#/vets" class="see-all-link">See all vets &rarr;</a>' +
    '</section>';

  const featuredGrid = document.getElementById("featured-grid");
  featured.forEach(function (vet) {
    featuredGrid.appendChild(buildVeteranCard(vet));
  });
}
```

- [ ] **Step 2: Verify old charity copy is gone and new copy is present**

Run: `grep -niE "nonprofit|donor|overhead|Read a short story" view-home.js`
Expected: no output

Run: `grep -n "star-bullet\|Send a vet a few bucks" view-home.js`
Expected: matches for both

- [ ] **Step 3: Commit**

```bash
git add view-home.js
git commit -m "Rework home page hero and how-it-works copy"
```

---

### Task 5: Profile page layout and copy

**Files:**
- Modify: `view-profile.js` (full-file replace)

**Interfaces:**
- Consumes: `.profile-header-row` from Task 1; `avatarMarkup` from `avatars.js` (unchanged); `formatCurrency` from `data.js` (Task 2, now 2-decimal).
- Produces: nothing new consumed elsewhere.

- [ ] **Step 1: Replace the full contents of `view-profile.js`**

```js
function renderProfile(vet) {
  const content = document.getElementById("profile-content");
  content.innerHTML =
    '<div class="profile-header-row">' +
      avatarMarkup(vet.id, "avatar-large") +
      '<div>' +
        '<h2 class="veteran-name">' + vet.name + '</h2>' +
        '<p class="veteran-meta">' + vet.branch + ' &middot; ' + vet.era + '</p>' +
      '</div>' +
    '</div>' +
    '<p class="veteran-bio">' + vet.bio + '</p>' +
    '<p class="veteran-total" id="profile-total">' + formatCurrency(vet.totalTipped) + ' tipped</p>' +
    '<a class="confirm-button" href="#/tip/' + vet.id + '">Send $</a>';
}
```

- [ ] **Step 2: Verify the layout wrapper and new button label are present**

Run: `grep -n "profile-header-row\|Send \$" view-profile.js`
Expected: matches for both

- [ ] **Step 3: Commit**

```bash
git add view-profile.js
git commit -m "Switch profile to left-aligned contact-row layout, rename tip button"
```

---

### Task 6: Payment page — Venmo-style amount entry with disclosed fee

**Files:**
- Modify: `view-payment.js` (full-file replace)

**Interfaces:**
- Consumes: `.amount-entry`, `.amount-display`, `.amount-currency`, `.amount-input`, `.amount-chips`, `.amount-chip`, `.amount-chip.selected`, `.fee-breakdown`, `.fee-row`, `.fee-row.fee-total`, `.note-field`, `.payment-vet-summary`, `.payment-success-panel`, `.confirm-button` (all from Task 1); `formatCurrency`, `escapeHtml`, `sendTip` from `data.js` (Task 2); `avatarMarkup` from `avatars.js` (unchanged).
- Produces: `renderPayment(vet)` — same signature as before, still consumed by `router.js` for both `#/tip` and `#/tip/:id` (unchanged, no router edit needed).

This replaces the full card-checkout form (name/card number/expiry/CVC) with a big editable amount, preset chips, a disclosed flat $0.30 fee breakdown, and an optional note — no payment fields anywhere.

- [ ] **Step 1: Replace the full contents of `view-payment.js`**

```js
const TIP_FEE = 0.3;
let paymentVeteranId = null;

function pickRandomVeteran() {
  return VETERANS[Math.floor(Math.random() * VETERANS.length)];
}

function renderPayment(vet) {
  const targetVet = vet || pickRandomVeteran();
  paymentVeteranId = targetVet.id;

  const content = document.getElementById("payment-content");
  content.innerHTML =
    '<div class="payment-vet-summary">' +
      avatarMarkup(targetVet.id, "avatar") +
      '<div>' +
        '<h2 class="veteran-name">' + targetVet.name + '</h2>' +
        '<p class="veteran-meta">' + targetVet.branch + ' &middot; ' + targetVet.era + '</p>' +
      '</div>' +
    '</div>' +
    '<div class="amount-entry">' +
      '<div class="amount-display">' +
        '<span class="amount-currency">$</span>' +
        '<input type="number" id="amount-input" class="amount-input" min="1" step="1" value="1" inputmode="decimal">' +
      '</div>' +
      '<div class="amount-chips">' +
        '<button type="button" class="amount-chip" data-amount="1">$1</button>' +
        '<button type="button" class="amount-chip" data-amount="5">$5</button>' +
        '<button type="button" class="amount-chip" data-amount="10">$10</button>' +
        '<button type="button" class="amount-chip" data-amount="20">$20</button>' +
      '</div>' +
      '<div class="fee-breakdown">' +
        '<div class="fee-row"><span>You send</span><span id="fee-amount"></span></div>' +
        '<div class="fee-row"><span>Processing fee</span><span id="fee-fee"></span></div>' +
        '<div class="fee-row fee-total"><span>Total</span><span id="fee-total"></span></div>' +
      '</div>' +
      '<div class="note-field">' +
        '<label for="tip-note">Add a note (optional)</label>' +
        '<input type="text" id="tip-note" placeholder="For his service 🇺🇸" maxlength="60">' +
      '</div>' +
    '</div>' +
    '<button type="button" id="send-button" class="confirm-button">Send</button>';

  setUpPaymentFlow(targetVet);
}

function updateFeeBreakdown(amount) {
  const valid = amount && amount > 0;
  const total = valid ? amount + TIP_FEE : 0;

  document.getElementById("fee-amount").textContent = valid ? formatCurrency(amount) : "$0.00";
  document.getElementById("fee-fee").textContent = "+" + formatCurrency(TIP_FEE);
  document.getElementById("fee-total").textContent = valid ? formatCurrency(total) : "$0.00";

  const sendButton = document.getElementById("send-button");
  sendButton.textContent = valid ? "Send " + formatCurrency(total) : "Send";
  sendButton.disabled = !valid;
}

function setUpPaymentFlow(vet) {
  const amountInput = document.getElementById("amount-input");
  const chips = document.querySelectorAll(".amount-chip");
  const noteInput = document.getElementById("tip-note");
  const sendButton = document.getElementById("send-button");

  function selectChipFor(amount) {
    chips.forEach(function (chip) {
      chip.classList.toggle("selected", Number(chip.dataset.amount) === amount);
    });
  }

  selectChipFor(Number(amountInput.value));
  updateFeeBreakdown(Number(amountInput.value));

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      const amount = Number(chip.dataset.amount);
      amountInput.value = amount;
      selectChipFor(amount);
      updateFeeBreakdown(amount);
    });
  });

  amountInput.addEventListener("input", function () {
    const amount = Number(amountInput.value);
    selectChipFor(amount);
    updateFeeBreakdown(amount);
  });

  sendButton.addEventListener("click", function () {
    const amount = Number(amountInput.value);
    if (!amount || amount <= 0) {
      return;
    }

    sendTip(paymentVeteranId, amount);
    const note = noteInput.value.trim();

    const content = document.getElementById("payment-content");
    content.innerHTML =
      '<div class="payment-success-panel">' +
        avatarMarkup(vet.id, "avatar-large") +
        '<h2>Sent! 🎉</h2>' +
        '<p>' + vet.name + ' just got ' + formatCurrency(amount) + ' from you' +
        (note ? ' &mdash; &ldquo;' + escapeHtml(note) + '&rdquo;' : '') + '.</p>' +
        '<a class="confirm-button payment-link" href="#/vets/' + vet.id + '">Back to profile</a>' +
      '</div>';
  });
}
```

- [ ] **Step 2: Verify no card-checkout fields remain and the fee is disclosed**

Run: `grep -niE "card-number|card-expiry|card-cvc|donor-name|Payment successful" view-payment.js`
Expected: no output

Run: `grep -n "TIP_FEE\|fee-breakdown\|amount-chip" view-payment.js`
Expected: matches for all three

- [ ] **Step 3: Commit**

```bash
git add view-payment.js
git commit -m "Replace card-checkout form with Venmo-style amount entry and disclosed fee"
```

---

### Task 7: Add-a-Vet form copy

**Files:**
- Modify: `view-submit.js` (full-file replace)

**Interfaces:**
- Consumes: `escapeHtml` now from `data.js` (Task 2) — local definition removed here; `.checkout-form` styling from Task 1.
- Produces: `renderSubmitForm()` — same signature as before, still consumed by `router.js` (unchanged).

- [ ] **Step 1: Replace the full contents of `view-submit.js`**

```js
function initialsFromName(name) {
  return name
    .split(" ")
    .filter(function (part) { return part.length > 0; })
    .slice(0, 2)
    .map(function (part) { return part[0].toUpperCase(); })
    .join("");
}

function renderSubmitForm() {
  const container = document.getElementById("submit-content");
  container.innerHTML =
    '<form id="submit-vet-form" class="checkout-form">' +
      '<label for="submit-name">Veteran\'s name</label>' +
      '<input type="text" id="submit-name" required placeholder="Full name">' +
      '<label for="submit-branch">Branch</label>' +
      '<select id="submit-branch" required>' +
        '<option value="">Select a branch</option>' +
        '<option value="Army">Army</option>' +
        '<option value="Navy">Navy</option>' +
        '<option value="Air Force">Air Force</option>' +
        '<option value="Marines">Marines</option>' +
        '<option value="Coast Guard">Coast Guard</option>' +
      '</select>' +
      '<label for="submit-era">Era of service</label>' +
      '<input type="text" id="submit-era" required placeholder="e.g. Vietnam, Gulf War">' +
      '<label for="submit-bio">Short story</label>' +
      '<textarea id="submit-bio" required rows="4" placeholder="Tell us about them"></textarea>' +
      '<button type="submit" class="confirm-button">Add Vet</button>' +
    '</form>' +
    '<div id="submit-success" class="submit-success" hidden></div>';

  setUpSubmitForm();
}

function setUpSubmitForm() {
  const form = document.getElementById("submit-vet-form");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("submit-name").value.trim();
    const branch = document.getElementById("submit-branch").value;
    const era = document.getElementById("submit-era").value.trim();
    const bio = document.getElementById("submit-bio").value.trim();

    if (!name || !branch || !era || !bio) {
      return;
    }

    const newVet = {
      id: "v" + (VETERANS.length + 1),
      name: escapeHtml(name),
      branch: escapeHtml(branch),
      era: escapeHtml(era),
      bio: escapeHtml(bio),
      avatarInitials: initialsFromName(name),
      totalTipped: 0,
    };
    VETERANS.push(newVet);

    form.hidden = true;
    const success = document.getElementById("submit-success");
    success.hidden = false;
    success.innerHTML =
      '<p>Done &mdash; ' + escapeHtml(name) + '\'s on the list.</p>' +
      '<a class="confirm-button" href="#/vets/' + newVet.id + '">View their profile</a>';
  });
}
```

- [ ] **Step 2: Verify the local `escapeHtml` definition is gone and copy updated**

Run: `grep -n "function escapeHtml" view-submit.js`
Expected: no output (now only defined in `data.js`)

Run: `grep -n "Add Vet\|Done &mdash;" view-submit.js`
Expected: matches for both

- [ ] **Step 3: Commit**

```bash
git add view-submit.js
git commit -m "Update add-a-vet form copy, use shared escapeHtml from data.js"
```

---

### Task 8: Vets We've Tipped page — renamed field and copy

**Files:**
- Modify: `view-served.js` (full-file replace)

**Interfaces:**
- Consumes: `SERVED_VETERANS[].totalReceived` from `data.js` (Task 2); `formatCurrency` from `data.js` (2-decimal, Task 2).

- [ ] **Step 1: Replace the full contents of `view-served.js`**

```js
function renderServedVets() {
  const grid = document.getElementById("served-grid");
  grid.innerHTML = "";

  SERVED_VETERANS.forEach(function (vet) {
    const card = document.createElement("div");
    card.className = "veteran-card served-card";
    card.innerHTML =
      avatarMarkup(vet.id, "avatar") +
      '<h2 class="veteran-name">' + vet.name + '</h2>' +
      '<p class="veteran-meta">' + vet.branch + ' &middot; ' + vet.era + '</p>' +
      '<p class="served-outcome">' + vet.outcomeBlurb + '</p>' +
      '<p class="veteran-total">' + formatCurrency(vet.totalReceived) + ' received</p>';
    grid.appendChild(card);
  });
}
```

- [ ] **Step 2: Verify the field rename and copy are used consistently**

Run: `grep -niE "totalRaised|raised" view-served.js`
Expected: no output

Run: `grep -n "totalReceived\|received" view-served.js`
Expected: matches for both

- [ ] **Step 3: Commit**

```bash
git add view-served.js
git commit -m "Use renamed totalReceived field and 'received' copy on Vets We've Tipped page"
```

---

## Final Manual Verification (all tasks complete)

- [ ] Open `index.html` directly in a browser (double-click, or `file://` path — no server needed) and click through: Home → Browse Vets → a veteran profile → Send $ (payment page) → adjust amount via chips and by typing → confirm the fee breakdown updates and shows `+$0.30` → Send → success message → Back to profile → totals updated. Then check Add a Vet (submit a new veteran, confirm success + new profile) and Vets We've Tipped (confirm "received" language, no "raised").
- [ ] Run a final repo-wide sweep for leftover charity language: `grep -rniE "nonprofit|donor|overhead skimmed" *.html *.js` — expected: no output.
