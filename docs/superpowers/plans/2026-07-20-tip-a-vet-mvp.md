# Tip a Vet MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a click-through pitch mockup of "Tip a Vet" — a donor-facing web page where a visitor browses fictional veteran profiles and sends a simulated tip, with the veteran's total updating live.

**Architecture:** A single `index.html` with two view containers (directory grid, veteran profile) toggled by a hand-rolled hash router in vanilla JavaScript. All data lives in an in-memory array seeded at load time — no server, no persistence, no real payment processing.

**Tech Stack:** Plain HTML, CSS, and vanilla JavaScript. No framework, no TypeScript, no build tools, no npm dependencies, no bundler. The site runs by opening `index.html` directly in a browser (must work over `file://`, so no ES modules — use plain `<script>` tags and global scope).

## Global Constraints

- No framework, build tools, npm, or TypeScript — plain HTML/CSS/vanilla JS only, per `docs/superpowers/specs/2026-07-20-tip-a-vet-design.md`.
- Must open and run directly via `file://` (double-clicking `index.html`) — no ES module `import`/`export`, no dev server required.
- Navigation is hash-based (`#/`, `#/vets/:id`) so a veteran's profile is a shareable/bookmarkable link and back/forward works.
- All veteran and tip data lives in an in-memory JS array (module-level state). No `localStorage`, no database, no server. Data resets on page reload.
- No real payment integration anywhere — tipping is fully simulated.
- Seed data is 100% fictional (invented names, bios, avatars as initials) — never real people's names or photos.
- No automated test suite for this MVP — verification is manual, via clicking through in a browser.
- Visual style: patriotic/military-inspired palette (navy, gold/brass, deep red) on a clean card-based layout. Tagline "Tip a Vet a Buck" must appear on the page.
- This is a pitch/concept mockup (used to produce screenshots for a stakeholder), not a live payment product — no compliance/legal handling is in scope.

---

### Task 1: Project scaffold

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `data.js`
- Create: `app.js`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: page structure with element ids `#veteran-grid`, `#directory-view`, `#profile-view`, `#profile-content`, `#back-button` for later tasks to hook into. CSS custom properties `--color-navy`, `--color-navy-dark`, `--color-gold`, `--color-red`, `--color-cream`, `--color-text` for later tasks to reuse. Empty `data.js` and `app.js` files that later tasks will fill in.

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tip a Vet</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header class="site-header">
  <h1>Tip a Vet</h1>
  <p class="tagline">Tip a Vet a Buck</p>
</header>

<main id="app">
  <section id="directory-view" class="view">
    <div id="veteran-grid" class="veteran-grid"></div>
  </section>

  <section id="profile-view" class="view" hidden>
    <button type="button" id="back-button" class="back-button">&larr; Back to Directory</button>
    <div id="profile-content" class="profile-content"></div>
  </section>
</main>

<script src="data.js"></script>
<script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `styles.css`**

```css
:root {
  --color-navy: #0b2545;
  --color-navy-dark: #071a33;
  --color-gold: #c9a35a;
  --color-red: #8c1c2c;
  --color-cream: #f7f3ea;
  --color-text: #1c1c1c;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: var(--color-cream);
  color: var(--color-text);
}

.site-header {
  background-color: var(--color-navy);
  color: var(--color-cream);
  text-align: center;
  padding: 2rem 1rem;
}

.site-header h1 {
  font-size: 2rem;
  letter-spacing: 0.05em;
}

.site-header .tagline {
  color: var(--color-gold);
  margin-top: 0.5rem;
  font-style: italic;
}

#app {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.view[hidden] {
  display: none;
}
```

- [ ] **Step 3: Create empty `data.js` and `app.js`**

Create `data.js` with this exact content (a single comment line, filled in Task 2):

```js
// Seed data — populated in Task 2
```

Create `app.js` with this exact content (a single comment line, filled in Task 2):

```js
// App logic — populated in Task 2
```

- [ ] **Step 4: Manually verify the scaffold**

Open `index.html` directly in a browser (double-click the file, or drag it into a browser window). Open the browser's developer console.

Expected:
- A navy header bar reading "Tip a Vet" with the gold italic tagline "Tip a Vet a Buck" underneath.
- An empty cream-colored content area below the header.
- No errors in the developer console (both scripts load with 200, not 404).

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css data.js app.js
git commit -m "Scaffold Tip a Vet page structure and base styles"
```

---

### Task 2: Seed data and directory view

**Files:**
- Modify: `data.js` (replace placeholder comment)
- Modify: `app.js` (replace placeholder comment)
- Modify: `styles.css` (append grid/card styles)

**Interfaces:**
- Consumes: `#veteran-grid` element from Task 1.
- Produces: global `VETERANS` array, global `TIPS` array (empty, used starting Task 4), `formatCurrency(amount: number): string`, `findVeteran(id: string): object | undefined`, `renderDirectory(): void`, a temporary simple `router(): void` (replaced in Task 3).

- [ ] **Step 1: Replace `data.js` with seed data**

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
```

- [ ] **Step 2: Replace `app.js` with directory rendering logic**

```js
function formatCurrency(amount) {
  return "$" + amount.toFixed(0);
}

function findVeteran(id) {
  return VETERANS.find(function (v) { return v.id === id; });
}

function renderDirectory() {
  const grid = document.getElementById("veteran-grid");
  grid.innerHTML = "";

  VETERANS.forEach(function (vet) {
    const card = document.createElement("a");
    card.className = "veteran-card";
    card.href = "#/vets/" + vet.id;
    card.innerHTML =
      '<div class="avatar">' + vet.avatarInitials + '</div>' +
      '<h2 class="veteran-name">' + vet.name + '</h2>' +
      '<p class="veteran-meta">' + vet.branch + ' &middot; ' + vet.era + '</p>' +
      '<p class="veteran-total">' + formatCurrency(vet.totalTipped) + ' tipped</p>';
    grid.appendChild(card);
  });
}

function router() {
  renderDirectory();
}

window.addEventListener("DOMContentLoaded", router);
```

- [ ] **Step 3: Append card/grid styles to `styles.css`**

```css

.veteran-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.veteran-card {
  display: block;
  background-color: #ffffff;
  border: 1px solid #e0dccf;
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  text-decoration: none;
  color: var(--color-text);
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.veteran-card:hover {
  border-color: var(--color-gold);
  transform: translateY(-2px);
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--color-navy);
  color: var(--color-cream);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
  margin: 0 auto 1rem;
}

.veteran-name {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.veteran-meta {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.veteran-total {
  color: var(--color-red);
  font-weight: bold;
}
```

- [ ] **Step 4: Manually verify the directory view**

Reload `index.html` in the browser.

Expected:
- Six veteran cards in a responsive grid, each showing a circular navy avatar with initials, name, branch/era, and "$0 tipped".
- Hovering a card lifts it slightly and highlights the border in gold.
- No console errors. Clicking a card changes the URL hash but doesn't navigate anywhere yet — that's expected, it's built in Task 3.

- [ ] **Step 5: Commit**

```bash
git add data.js app.js styles.css
git commit -m "Add veteran seed data and directory grid view"
```

---

### Task 3: Hash router and veteran profile view

**Files:**
- Modify: `app.js` (replace the `router` function and its listener registration)
- Modify: `styles.css` (append profile view styles)

**Interfaces:**
- Consumes: `VETERANS`, `findVeteran`, `formatCurrency`, `renderDirectory` from Task 2; `#profile-view`, `#profile-content`, `#back-button` elements from Task 1.
- Produces: `showView(viewId: string): void`, `renderProfile(vet: object): void` (superseded by Task 4's version), full hash-aware `router(): void`.

- [ ] **Step 1: Replace the router in `app.js`**

Find this block at the end of `app.js`:

```js
function router() {
  renderDirectory();
}

window.addEventListener("DOMContentLoaded", router);
```

Replace it with:

```js
function showView(viewId) {
  document.querySelectorAll(".view").forEach(function (view) {
    view.hidden = view.id !== viewId;
  });
}

function renderProfile(vet) {
  const content = document.getElementById("profile-content");
  content.innerHTML =
    '<div class="avatar avatar-large">' + vet.avatarInitials + '</div>' +
    '<h2 class="veteran-name">' + vet.name + '</h2>' +
    '<p class="veteran-meta">' + vet.branch + ' &middot; ' + vet.era + '</p>' +
    '<p class="veteran-bio">' + vet.bio + '</p>' +
    '<p class="veteran-total" id="profile-total">' + formatCurrency(vet.totalTipped) + ' tipped</p>';
}

function router() {
  const hash = window.location.hash;
  const profileMatch = hash.match(/^#\/vets\/(.+)$/);

  if (profileMatch) {
    const vet = findVeteran(profileMatch[1]);
    if (vet) {
      renderProfile(vet);
      showView("profile-view");
      return;
    }
  }

  renderDirectory();
  showView("directory-view");
}

document.getElementById("back-button").addEventListener("click", function () {
  window.location.hash = "#/";
});

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
```

- [ ] **Step 2: Append profile view styles to `styles.css`**

```css

.back-button {
  background: none;
  border: none;
  color: var(--color-navy);
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  padding: 0;
}

.back-button:hover {
  text-decoration: underline;
}

.profile-content {
  background-color: #ffffff;
  border: 1px solid #e0dccf;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  max-width: 480px;
  margin: 0 auto;
}

.avatar-large {
  width: 96px;
  height: 96px;
  font-size: 1.75rem;
}

.veteran-bio {
  margin: 1rem 0;
  line-height: 1.5;
  color: #333;
}
```

- [ ] **Step 3: Manually verify navigation**

Reload `index.html` (starts on the directory view). Click on "Eleanor Marsh".

Expected:
- The URL hash becomes `#/vets/v2`.
- The directory grid disappears and a profile card appears: large avatar "EM", name, "Navy · WWII", her bio, and "$0 tipped".
- Click "← Back to Directory" — the hash becomes `#/` and the grid reappears.
- Manually edit the address bar to end in `#/vets/v5` and press Enter — the page loads directly into Walter Higgins's profile without going through the directory first.
- Manually edit the address bar to end in `#/vets/does-not-exist` — the page falls back to the directory view without a JavaScript error.

- [ ] **Step 4: Commit**

```bash
git add app.js styles.css
git commit -m "Add hash router and veteran profile view"
```

---

### Task 4: Tip flow

**Files:**
- Modify: `app.js` (replace the `renderProfile` function with a version that includes the tip flow, and add `sendTip`/`setUpTipFlow`)
- Modify: `styles.css` (append tip flow styles)

**Interfaces:**
- Consumes: `findVeteran`, `formatCurrency`, `VETERANS`, `TIPS` from Task 2; `renderProfile` call site inside `router()` from Task 3; the `#profile-total` id introduced by Task 3's `renderProfile` markup.
- Produces: `sendTip(veteranId: string, amount: number): number` (returns the veteran's new total), `setUpTipFlow(): void`, final `renderProfile(vet: object): void` including the tip flow UI, module state `currentVeteranId` and `selectedAmount`.

- [ ] **Step 1: Replace `renderProfile` in `app.js`**

Find this block (added in Task 3):

```js
function renderProfile(vet) {
  const content = document.getElementById("profile-content");
  content.innerHTML =
    '<div class="avatar avatar-large">' + vet.avatarInitials + '</div>' +
    '<h2 class="veteran-name">' + vet.name + '</h2>' +
    '<p class="veteran-meta">' + vet.branch + ' &middot; ' + vet.era + '</p>' +
    '<p class="veteran-bio">' + vet.bio + '</p>' +
    '<p class="veteran-total" id="profile-total">' + formatCurrency(vet.totalTipped) + ' tipped</p>';
}
```

Replace it with:

```js
let currentVeteranId = null;
let selectedAmount = null;

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

function renderProfile(vet) {
  currentVeteranId = vet.id;
  selectedAmount = null;

  const content = document.getElementById("profile-content");
  content.innerHTML =
    '<div class="avatar avatar-large">' + vet.avatarInitials + '</div>' +
    '<h2 class="veteran-name">' + vet.name + '</h2>' +
    '<p class="veteran-meta">' + vet.branch + ' &middot; ' + vet.era + '</p>' +
    '<p class="veteran-bio">' + vet.bio + '</p>' +
    '<p class="veteran-total" id="profile-total">' + formatCurrency(vet.totalTipped) + ' tipped</p>' +
    '<div class="tip-flow">' +
      '<p class="tip-flow-label">Send a tip</p>' +
      '<div class="amount-options">' +
        '<button type="button" class="amount-button" data-amount="1">$1</button>' +
        '<button type="button" class="amount-button" data-amount="5">$5</button>' +
        '<button type="button" class="amount-button" data-amount="10">$10</button>' +
        '<button type="button" class="amount-button" data-amount="20">$20</button>' +
      '</div>' +
      '<div class="custom-amount">' +
        '<label for="custom-amount-input">Or enter a custom amount</label>' +
        '<input type="number" id="custom-amount-input" min="1" step="1" placeholder="Custom $">' +
      '</div>' +
      '<button type="button" id="confirm-tip-button" class="confirm-button" disabled>Confirm Tip</button>' +
      '<p id="tip-success-message" class="tip-success-message" hidden>Tip sent!</p>' +
    '</div>';

  setUpTipFlow();
}

function setUpTipFlow() {
  const amountButtons = document.querySelectorAll(".amount-button");
  const customInput = document.getElementById("custom-amount-input");
  const confirmButton = document.getElementById("confirm-tip-button");

  amountButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectedAmount = Number(button.dataset.amount);
      amountButtons.forEach(function (b) { b.classList.remove("selected"); });
      button.classList.add("selected");
      customInput.value = "";
      confirmButton.disabled = false;
    });
  });

  customInput.addEventListener("input", function () {
    const value = Number(customInput.value);
    if (customInput.value && value > 0) {
      selectedAmount = value;
      amountButtons.forEach(function (b) { b.classList.remove("selected"); });
      confirmButton.disabled = false;
    } else {
      selectedAmount = null;
      confirmButton.disabled = true;
    }
  });

  confirmButton.addEventListener("click", function () {
    const newTotal = sendTip(currentVeteranId, selectedAmount);

    document.getElementById("profile-total").textContent = formatCurrency(newTotal) + " tipped";

    const successMessage = document.getElementById("tip-success-message");
    successMessage.hidden = false;
    setTimeout(function () {
      successMessage.hidden = true;
    }, 2000);

    amountButtons.forEach(function (b) { b.classList.remove("selected"); });
    customInput.value = "";
    selectedAmount = null;
    confirmButton.disabled = true;
  });
}
```

- [ ] **Step 2: Append tip flow styles to `styles.css`**

```css

.tip-flow {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0dccf;
}

.tip-flow-label {
  font-weight: bold;
  margin-bottom: 0.75rem;
}

.amount-options {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.amount-button {
  border: 2px solid var(--color-navy);
  background-color: transparent;
  color: var(--color-navy);
  padding: 0.5rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 1rem;
}

.amount-button.selected {
  background-color: var(--color-gold);
  border-color: var(--color-gold);
  color: var(--color-navy-dark);
}

.custom-amount {
  margin-bottom: 1rem;
}

.custom-amount label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.35rem;
}

.custom-amount input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.35rem;
  font-size: 1rem;
}

.confirm-button {
  width: 100%;
  background-color: var(--color-red);
  color: var(--color-cream);
  border: none;
  padding: 0.75rem;
  border-radius: 0.35rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}

.confirm-button:disabled {
  background-color: #ccc;
  color: #888;
  cursor: not-allowed;
}

.tip-success-message {
  margin-top: 1rem;
  color: var(--color-navy);
  font-weight: bold;
}
```

- [ ] **Step 3: Manually verify the full tip flow**

Reload `index.html`. Click into "James \"Jimmy\" Doyle"'s profile.

Expected:
- Below his bio and "$0 tipped", a "Send a tip" section with four pill buttons ($1/$5/$10/$20), a custom-amount input, and a disabled "Confirm Tip" button.
- Click "$5" — the button turns gold/selected and "Confirm Tip" becomes enabled.
- Click "Confirm Tip" — "$5 tipped" replaces "$0 tipped" immediately, a "Tip sent!" message appears below the button, and disappears again after ~2 seconds. The amount button deselects and the confirm button becomes disabled again.
- Type "3" into the custom amount field — "Confirm Tip" enables and no preset button is selected. Confirm it — total becomes "$8 tipped".
- Click "← Back to Directory" — Jimmy Doyle's card in the grid now shows "$8 tipped", confirming the shared in-memory state updates across views.
- Refresh the page — totals reset back to $0, confirming there's no persistence (expected per spec).

- [ ] **Step 4: Commit**

```bash
git add app.js styles.css
git commit -m "Add tip flow: amount selection, confirm, and live total updates"
```
