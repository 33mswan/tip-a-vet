# Tip a Vet Multi-Page Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the existing "Tip a Vet" MVP into `master` and expand it from a two-view directory/profile app into a multi-page pitch mockup with a home page, site-wide navigation, a dedicated payment page, a "Submit a Vet" form, and a "Past Vets Served" page.

**Architecture:** Plain HTML/CSS/vanilla JS, hash-routed single-page app split across per-view script files (`view-home.js`, `view-directory.js`, `view-profile.js`, `view-payment.js`, `view-submit.js`, `view-served.js`), a shared `router.js`, a shared `avatars.js` avatar generator, and `data.js` for state. No framework, no build step.

**Tech Stack:** Plain HTML, CSS, vanilla JavaScript. No framework, no TypeScript, no build tools, no npm dependencies, no bundler.

## Global Constraints

- No framework, build tools, npm, or TypeScript — plain HTML/CSS/vanilla JS only, per `docs/superpowers/specs/2026-07-20-tip-a-vet-design.md` and `docs/superpowers/specs/2026-07-23-tip-a-vet-expansion-design.md`.
- Must open and run directly via `file://` — no ES module `import`/`export`, plain `<script>` tags in global scope, no dev server required.
- Navigation is hash-based. Routes: `#/` (home), `#/vets` (directory), `#/vets/:id` (profile), `#/tip` (quick payment, random vet), `#/tip/:id` (payment for a specific vet), `#/submit` (submit a vet), `#/served` (past vets served). Unmatched hashes fall back to home.
- All veteran, tip, and submission data lives in in-memory JS arrays (module-level state). No `localStorage`, no database, no server. Data resets on page reload.
- No real payment integration anywhere — all card fields on the payment page are visual only and are never transmitted or persisted.
- No real, identifiable stock photos of real people. Avatars are deterministic, illustrated SVGs generated from a seed (the veteran's id) — not photographs.
- Seed data (veterans, served veterans) is 100% fictional — never real people's names.
- No automated test suite — verification is manual, via clicking through in a browser, per existing project convention.
- Visual style stays patriotic/military-inspired (navy, gold/brass, deep red) on a clean card-based layout. "Tip a Vet a Buck" must remain prominently visible (nav button + home hero button).
- This remains a pitch/concept mockup (used for stakeholder screenshots), not a live product — no compliance/legal handling is in scope.

---

### Task 1: Merge existing MVP into master

**Files:**
- Merge: branch `worktree-tip-a-vet-mvp` into `master` — introduces `index.html`, `styles.css`, `data.js`, `app.js` at the repo root.

**Interfaces:**
- Consumes: nothing (first task).
- Produces: element ids `#veteran-grid`, `#directory-view`, `#profile-view`, `#profile-content`, `#back-button`; globals `VETERANS`, `TIPS`, `formatCurrency`, `findVeteran`, `renderDirectory`, `renderProfile`, `sendTip`, `router`, `showView` — all consumed by Task 2.

- [ ] **Step 1: Merge the branch**

```bash
git merge worktree-tip-a-vet-mvp -m "Merge Tip a Vet MVP into master"
```

Expected: merge completes with no conflicts. `git status` shows `index.html`, `styles.css`, `data.js`, `app.js` now present and tracked on `master`.

- [ ] **Step 2: Manually verify the merged MVP**

Open `index.html` directly in a browser (double-click, or drag into a browser window).

Expected:
- Navy header reading "Tip a Vet" with gold italic tagline "Tip a Vet a Buck".
- Six veteran cards in a grid, each with an initials avatar, name, branch/era, "$0 tipped".
- Clicking a card opens that veteran's profile with bio and a tip flow (preset $1/$5/$10/$20 buttons, custom amount input, Confirm Tip button).
- Selecting an amount and confirming updates the total immediately; "← Back to Directory" returns to the grid with the updated total shown on the card.
- No console errors.

---

### Task 2: Illustrated avatars + split into per-view files

**Files:**
- Create: `avatars.js`
- Create: `router.js`
- Create: `view-directory.js`
- Create: `view-profile.js`
- Modify: `data.js` (append `sendTip`)
- Modify: `app.js` (replace with wiring-only content)
- Modify: `index.html` (replace script tags)
- Modify: `styles.css` (replace `.avatar` rule)

**Interfaces:**
- Consumes: `VETERANS`, `TIPS`, `formatCurrency`, `findVeteran` from `data.js`; `#veteran-grid`, `#directory-view`, `#profile-view`, `#profile-content`, `#back-button` from `index.html`.
- Produces: `generateAvatarSVG(seed: string): string`, `avatarMarkup(seed: string, sizeClass: string): string` (in `avatars.js`, consumed by every later view); `buildVeteranCard(vet: object): HTMLElement`, `renderDirectory(): void` (in `view-directory.js`, `buildVeteranCard` consumed by Task 6's home view); `renderProfile(vet: object): void` (in `view-profile.js`, replaced again in Task 3); `showView(viewId: string): void`, `router(): void` (in `router.js`, extended in Tasks 3–6); `sendTip(veteranId: string, amount: number): number` (in `data.js`, consumed by Task 3's payment view).

- [ ] **Step 1: Create `avatars.js`**

```js
function seededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return function () {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

const AVATAR_SKIN_TONES = ["#f2d3b3", "#e8b48c", "#c68863", "#8d5a3b", "#5c3a21"];
const AVATAR_HAIR_COLORS = ["#2b1b0e", "#5c3a21", "#8a6d3b", "#c9a35a", "#4a4a4a", "#1c1c1c"];

function generateAvatarSVG(seed) {
  const rand = seededRandom(seed);
  const skin = AVATAR_SKIN_TONES[Math.floor(rand() * AVATAR_SKIN_TONES.length)];
  const hair = AVATAR_HAIR_COLORS[Math.floor(rand() * AVATAR_HAIR_COLORS.length)];
  const hairStyle = Math.floor(rand() * 3);
  const mouthCurve = rand() > 0.5 ? 8 : 2;

  let hairShape = "";
  if (hairStyle === 0) {
    hairShape = '<path d="M20 45 Q50 5 80 45 L80 35 Q50 15 20 35 Z" fill="' + hair + '" />';
  } else if (hairStyle === 2) {
    hairShape = '<path d="M15 55 Q15 10 50 10 Q85 10 85 55 L78 55 Q78 25 50 22 Q22 25 22 55 Z" fill="' + hair + '" />';
  }

  return (
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustrated avatar">' +
      '<circle cx="50" cy="50" r="50" fill="#e7e2d4" />' +
      '<circle cx="50" cy="46" r="26" fill="' + skin + '" />' +
      '<rect x="38" y="64" width="24" height="20" fill="' + skin + '" />' +
      '<path d="M20 100 Q20 68 50 68 Q80 68 80 100 Z" fill="#0b2545" />' +
      hairShape +
      '<circle cx="41" cy="44" r="2.5" fill="#1c1c1c" />' +
      '<circle cx="59" cy="44" r="2.5" fill="#1c1c1c" />' +
      '<path d="M42 56 Q50 ' + (56 + mouthCurve) + ' 58 56" stroke="#7a4a3a" stroke-width="2" fill="none" stroke-linecap="round" />' +
    '</svg>'
  );
}

function avatarMarkup(seed, sizeClass) {
  return '<div class="avatar ' + sizeClass + '">' + generateAvatarSVG(seed) + '</div>';
}
```

- [ ] **Step 2: Append `sendTip` to `data.js`**

Append to the end of `data.js`:

```js

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
```

- [ ] **Step 3: Create `view-directory.js`**

```js
function buildVeteranCard(vet) {
  const card = document.createElement("a");
  card.className = "veteran-card";
  card.href = "#/vets/" + vet.id;
  card.innerHTML =
    avatarMarkup(vet.id, "avatar") +
    '<h2 class="veteran-name">' + vet.name + '</h2>' +
    '<p class="veteran-meta">' + vet.branch + ' &middot; ' + vet.era + '</p>' +
    '<p class="veteran-total">' + formatCurrency(vet.totalTipped) + ' tipped</p>';
  return card;
}

function renderDirectory() {
  const grid = document.getElementById("veteran-grid");
  grid.innerHTML = "";
  VETERANS.forEach(function (vet) {
    grid.appendChild(buildVeteranCard(vet));
  });
}
```

- [ ] **Step 4: Create `view-profile.js`**

```js
let currentVeteranId = null;
let selectedAmount = null;

function renderProfile(vet) {
  currentVeteranId = vet.id;
  selectedAmount = null;

  const content = document.getElementById("profile-content");
  content.innerHTML =
    avatarMarkup(vet.id, "avatar-large") +
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
    amountButtons.forEach(function (b) { b.classList.remove("selected"); });
    if (customInput.value && value > 0) {
      selectedAmount = value;
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

- [ ] **Step 5: Create `router.js`**

```js
function showView(viewId) {
  document.querySelectorAll(".view").forEach(function (view) {
    view.hidden = view.id !== viewId;
  });
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

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
```

- [ ] **Step 6: Replace `app.js`**

Replace the entire contents of `app.js` with:

```js
document.getElementById("back-button").addEventListener("click", function () {
  window.location.hash = "#/";
});
```

- [ ] **Step 7: Update script tags in `index.html`**

Find:

```html
<script src="data.js"></script>
<script src="app.js"></script>
```

Replace with:

```html
<script src="data.js"></script>
<script src="avatars.js"></script>
<script src="router.js"></script>
<script src="view-directory.js"></script>
<script src="view-profile.js"></script>
<script src="app.js"></script>
```

- [ ] **Step 8: Replace the `.avatar` rule in `styles.css`**

Find:

```css
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
```

Replace with:

```css
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
```

- [ ] **Step 9: Manually verify**

Reload `index.html` in the browser.

Expected:
- Directory cards show illustrated circular avatar SVGs (not initials) — varied skin tone/hair per vet.
- Reloading the page shows the exact same avatar per vet each time (deterministic).
- Clicking into a profile shows a larger version of that same vet's avatar.
- The tip flow still works exactly as before (select/confirm amount updates total, back button returns to grid with updated total).
- No console errors.

- [ ] **Step 10: Commit**

```bash
git add avatars.js router.js view-directory.js view-profile.js data.js app.js index.html styles.css
git commit -m "Split into per-view files and add illustrated avatar generator"
```

---

### Task 3: Dedicated payment page

**Files:**
- Create: `view-payment.js`
- Modify: `view-profile.js` (remove inline tip flow, replace with a link)
- Modify: `router.js` (add `#/tip` and `#/tip/:id` routes)
- Modify: `app.js` (wire `#payment-back-button`)
- Modify: `index.html` (add `#payment-view` section, add script tag)
- Modify: `styles.css` (checkout form styles, `.confirm-button` anchor support)

**Interfaces:**
- Consumes: `VETERANS`, `findVeteran`, `formatCurrency`, `sendTip`, `avatarMarkup` from earlier tasks; `#payment-content`, `#payment-back-button` from `index.html`.
- Produces: `renderPayment(vet: object | null): void` (consumed by `router.js`, and by Task 6's home hero button link `#/tip`).

- [ ] **Step 1: Create `view-payment.js`**

```js
let paymentVeteranId = null;
let paymentSelectedAmount = null;

function pickRandomVeteran() {
  return VETERANS[Math.floor(Math.random() * VETERANS.length)];
}

function renderPayment(vet) {
  const targetVet = vet || pickRandomVeteran();
  paymentVeteranId = targetVet.id;
  paymentSelectedAmount = vet ? null : 1;

  const content = document.getElementById("payment-content");
  content.innerHTML =
    '<div class="payment-vet-summary">' +
      avatarMarkup(targetVet.id, "avatar") +
      '<div>' +
        '<h2 class="veteran-name">' + targetVet.name + '</h2>' +
        '<p class="veteran-meta">' + targetVet.branch + ' &middot; ' + targetVet.era + '</p>' +
      '</div>' +
    '</div>' +
    '<div class="tip-flow">' +
      '<p class="tip-flow-label">Amount</p>' +
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
    '</div>' +
    '<form id="checkout-form" class="checkout-form">' +
      '<label for="donor-name">Name on card</label>' +
      '<input type="text" id="donor-name" required placeholder="Jane Donor">' +
      '<label for="card-number">Card number</label>' +
      '<input type="text" id="card-number" required placeholder="4242 4242 4242 4242" maxlength="19">' +
      '<div class="checkout-row">' +
        '<div>' +
          '<label for="card-expiry">Expiry</label>' +
          '<input type="text" id="card-expiry" required placeholder="MM/YY" maxlength="5">' +
        '</div>' +
        '<div>' +
          '<label for="card-cvc">CVC</label>' +
          '<input type="text" id="card-cvc" required placeholder="123" maxlength="4">' +
        '</div>' +
      '</div>' +
      '<button type="submit" id="pay-button" class="confirm-button">Pay</button>' +
    '</form>';

  setUpPaymentFlow(targetVet);
}

function setUpPaymentFlow(vet) {
  const amountButtons = document.querySelectorAll(".amount-button");
  const customInput = document.getElementById("custom-amount-input");
  const form = document.getElementById("checkout-form");

  if (paymentSelectedAmount) {
    amountButtons.forEach(function (b) {
      if (Number(b.dataset.amount) === paymentSelectedAmount) {
        b.classList.add("selected");
      }
    });
  }

  amountButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      paymentSelectedAmount = Number(button.dataset.amount);
      amountButtons.forEach(function (b) { b.classList.remove("selected"); });
      button.classList.add("selected");
      customInput.value = "";
    });
  });

  customInput.addEventListener("input", function () {
    const value = Number(customInput.value);
    amountButtons.forEach(function (b) { b.classList.remove("selected"); });
    paymentSelectedAmount = customInput.value && value > 0 ? value : null;
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!paymentSelectedAmount) {
      return;
    }

    const newTotal = sendTip(paymentVeteranId, paymentSelectedAmount);

    const content = document.getElementById("payment-content");
    content.innerHTML =
      '<div class="payment-success-panel">' +
        avatarMarkup(vet.id, "avatar-large") +
        '<h2>Payment successful!</h2>' +
        '<p>Thanks for tipping ' + vet.name + ' ' + formatCurrency(paymentSelectedAmount) + '. ' +
        'Their new total is ' + formatCurrency(newTotal) + '.</p>' +
        '<a class="confirm-button payment-link" href="#/vets/' + vet.id + '">Back to profile</a>' +
      '</div>';
  });
}
```

- [ ] **Step 2: Replace `renderProfile` in `view-profile.js`**

Replace the entire contents of `view-profile.js` with:

```js
function renderProfile(vet) {
  const content = document.getElementById("profile-content");
  content.innerHTML =
    avatarMarkup(vet.id, "avatar-large") +
    '<h2 class="veteran-name">' + vet.name + '</h2>' +
    '<p class="veteran-meta">' + vet.branch + ' &middot; ' + vet.era + '</p>' +
    '<p class="veteran-bio">' + vet.bio + '</p>' +
    '<p class="veteran-total" id="profile-total">' + formatCurrency(vet.totalTipped) + ' tipped</p>' +
    '<a class="confirm-button" href="#/tip/' + vet.id + '">Send a tip</a>';
}
```

- [ ] **Step 3: Replace `router.js`**

Replace the entire contents of `router.js` with:

```js
function showView(viewId) {
  document.querySelectorAll(".view").forEach(function (view) {
    view.hidden = view.id !== viewId;
  });
}

function router() {
  const hash = window.location.hash;
  const profileMatch = hash.match(/^#\/vets\/(.+)$/);
  const paymentMatch = hash.match(/^#\/tip\/(.+)$/);

  if (profileMatch) {
    const vet = findVeteran(profileMatch[1]);
    if (vet) {
      renderProfile(vet);
      showView("profile-view");
      return;
    }
  }

  if (hash === "#/tip") {
    renderPayment(null);
    showView("payment-view");
    return;
  }

  if (paymentMatch) {
    const vet = findVeteran(paymentMatch[1]);
    if (vet) {
      renderPayment(vet);
      showView("payment-view");
      return;
    }
  }

  renderDirectory();
  showView("directory-view");
}

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
```

- [ ] **Step 4: Replace `app.js`**

Replace the entire contents of `app.js` with:

```js
document.getElementById("back-button").addEventListener("click", function () {
  window.location.hash = "#/";
});

document.getElementById("payment-back-button").addEventListener("click", function () {
  window.location.hash = "#/";
});
```

- [ ] **Step 5: Add the payment view to `index.html`**

Find:

```html
  <section id="profile-view" class="view" hidden>
    <button type="button" id="back-button" class="back-button">&larr; Back to Directory</button>
    <div id="profile-content" class="profile-content"></div>
  </section>
</main>
```

Replace with:

```html
  <section id="profile-view" class="view" hidden>
    <button type="button" id="back-button" class="back-button">&larr; Back to Directory</button>
    <div id="profile-content" class="profile-content"></div>
  </section>

  <section id="payment-view" class="view" hidden>
    <button type="button" id="payment-back-button" class="back-button">&larr; Back</button>
    <div id="payment-content" class="payment-content"></div>
  </section>
</main>
```

- [ ] **Step 6: Add the script tag to `index.html`**

Find:

```html
<script src="view-profile.js"></script>
<script src="app.js"></script>
```

Replace with:

```html
<script src="view-profile.js"></script>
<script src="view-payment.js"></script>
<script src="app.js"></script>
```

- [ ] **Step 7: Replace the `.confirm-button` rule in `styles.css`**

Find:

```css
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
```

Replace with:

```css
.confirm-button {
  display: block;
  width: 100%;
  background-color: var(--color-red);
  color: var(--color-cream);
  border: none;
  padding: 0.75rem;
  border-radius: 0.35rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
}
```

- [ ] **Step 8: Append checkout/payment styles to `styles.css`**

Append to the end of `styles.css`:

```css

.payment-vet-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.payment-vet-summary .avatar {
  margin: 0;
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.checkout-form label {
  font-size: 0.85rem;
  color: #666;
}

.checkout-form input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.35rem;
  font-size: 1rem;
}

.checkout-row {
  display: flex;
  gap: 0.75rem;
}

.checkout-row > div {
  flex: 1;
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
  color: #333;
}

.payment-link {
  display: inline-block;
}
```

- [ ] **Step 9: Manually verify**

Reload `index.html`. Edit the address bar to end in `#/tip` and press Enter.

Expected:
- A random veteran's avatar/name/branch/era shown, $1 preset already selected (gold), a mock checkout form below (name, card number, expiry, CVC — all fake fields).
- Fill the fields and click "Pay" — a "Payment successful!" panel appears showing the updated total, with a "Back to profile" link.
- Click that link — lands on the vet's profile, "Send a tip" link is present (no inline flow), total reflects the $1 tip.
- Click "Send a tip" — navigates to `#/tip/<id>` for that vet, no amount pre-selected this time. Choose "$10", fill the mock card fields, click "Pay" — success panel shows total increased by $10.
- No console errors.

- [ ] **Step 10: Commit**

```bash
git add view-payment.js view-profile.js router.js app.js index.html styles.css
git commit -m "Add dedicated payment page, replace inline profile tip flow"
```

---

### Task 4: Submit a Vet page

**Files:**
- Create: `view-submit.js`
- Modify: `router.js` (add `#/submit` route)
- Modify: `index.html` (add `#submit-view` section, add script tag)
- Modify: `styles.css` (select/textarea/success styles)

**Interfaces:**
- Consumes: `VETERANS`, `avatarMarkup` from earlier tasks; `#submit-content` from `index.html`.
- Produces: `renderSubmitForm(): void` (consumed by `router.js`).

- [ ] **Step 1: Create `view-submit.js`**

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
      '<button type="submit" class="confirm-button">Submit Veteran</button>' +
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
      name: name,
      branch: branch,
      era: era,
      bio: bio,
      avatarInitials: initialsFromName(name),
      totalTipped: 0,
    };
    VETERANS.push(newVet);

    form.hidden = true;
    const success = document.getElementById("submit-success");
    success.hidden = false;
    success.innerHTML =
      '<p>Thanks &mdash; ' + name + ' is now listed!</p>' +
      '<a class="confirm-button" href="#/vets/' + newVet.id + '">View their profile</a>';
  });
}
```

- [ ] **Step 2: Add the `#/submit` route in `router.js`**

Find:

```js
  renderDirectory();
  showView("directory-view");
}

window.addEventListener("hashchange", router);
```

Replace with:

```js
  if (hash === "#/submit") {
    renderSubmitForm();
    showView("submit-view");
    return;
  }

  renderDirectory();
  showView("directory-view");
}

window.addEventListener("hashchange", router);
```

- [ ] **Step 3: Add the submit view to `index.html`**

Find:

```html
  <section id="payment-view" class="view" hidden>
    <button type="button" id="payment-back-button" class="back-button">&larr; Back</button>
    <div id="payment-content" class="payment-content"></div>
  </section>
</main>
```

Replace with:

```html
  <section id="payment-view" class="view" hidden>
    <button type="button" id="payment-back-button" class="back-button">&larr; Back</button>
    <div id="payment-content" class="payment-content"></div>
  </section>

  <section id="submit-view" class="view" hidden>
    <div class="page-heading">
      <h2>Submit a Veteran</h2>
      <p>Know a veteran who could use support? Tell us about them.</p>
    </div>
    <div id="submit-content" class="profile-content"></div>
  </section>
</main>
```

- [ ] **Step 4: Add the script tag to `index.html`**

Find:

```html
<script src="view-payment.js"></script>
<script src="app.js"></script>
```

Replace with:

```html
<script src="view-payment.js"></script>
<script src="view-submit.js"></script>
<script src="app.js"></script>
```

- [ ] **Step 5: Append form and heading styles to `styles.css`**

Append to the end of `styles.css`:

```css

.checkout-form textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.35rem;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
}

.checkout-form select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.35rem;
  font-size: 1rem;
  background-color: #fff;
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
```

- [ ] **Step 6: Manually verify**

Reload `index.html`. Edit the address bar to end in `#/submit`.

Expected:
- A form: name, branch dropdown, era, short story textarea, "Submit Veteran" button.
- Clicking "Submit Veteran" with empty fields does nothing (native HTML5 required-field validation blocks it).
- Fill all fields and submit — the form is replaced with "Thanks — <name> is now listed!" and a "View their profile" link.
- Click the link — lands on the new veteran's profile showing the submitted bio, avatar, and a working "Send a tip" link.
- Edit the address bar to `#/vets` — the new veteran's card appears in the directory grid alongside the original six.
- No console errors.

- [ ] **Step 7: Commit**

```bash
git add view-submit.js router.js index.html styles.css
git commit -m "Add Submit a Vet page"
```

---

### Task 5: Past Vets Served page

**Files:**
- Modify: `data.js` (append `SERVED_VETERANS`)
- Create: `view-served.js`
- Modify: `router.js` (add `#/served` route)
- Modify: `index.html` (add `#served-view` section, add script tag)
- Modify: `styles.css` (served outcome text style)

**Interfaces:**
- Consumes: `formatCurrency`, `avatarMarkup` from earlier tasks; `#served-grid` from `index.html`.
- Produces: `SERVED_VETERANS` (in `data.js`), `renderServedVets(): void` (consumed by `router.js`).

- [ ] **Step 1: Append `SERVED_VETERANS` to `data.js`**

Append to the end of `data.js`:

```js

const SERVED_VETERANS = [
  {
    id: "s1",
    name: "Harold \"Hal\" Whitfield",
    branch: "Navy",
    era: "Vietnam",
    outcomeBlurb: "Fully funded new hearing aids after his VA benefits lapsed.",
    totalRaised: 340,
  },
  {
    id: "s2",
    name: "Marjorie Simms",
    branch: "Army",
    era: "Gulf War",
    outcomeBlurb: "Covered three months of rent during a gap between jobs.",
    totalRaised: 890,
  },
  {
    id: "s3",
    name: "Louis Petrakis",
    branch: "Marines",
    era: "Korea",
    outcomeBlurb: "Funded a wheelchair ramp for his front porch.",
    totalRaised: 615,
  },
  {
    id: "s4",
    name: "Ruth Alden",
    branch: "Air Force",
    era: "WWII",
    outcomeBlurb: "Paid for a headstone marker honoring her service.",
    totalRaised: 275,
  },
];
```

- [ ] **Step 2: Create `view-served.js`**

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
      '<p class="veteran-total">' + formatCurrency(vet.totalRaised) + ' raised</p>';
    grid.appendChild(card);
  });
}
```

- [ ] **Step 3: Add the `#/served` route in `router.js`**

Find:

```js
  if (hash === "#/submit") {
    renderSubmitForm();
    showView("submit-view");
    return;
  }

  renderDirectory();
  showView("directory-view");
}
```

Replace with:

```js
  if (hash === "#/submit") {
    renderSubmitForm();
    showView("submit-view");
    return;
  }

  if (hash === "#/served") {
    renderServedVets();
    showView("served-view");
    return;
  }

  renderDirectory();
  showView("directory-view");
}
```

- [ ] **Step 4: Add the served view to `index.html`**

Find:

```html
  <section id="submit-view" class="view" hidden>
    <div class="page-heading">
      <h2>Submit a Veteran</h2>
      <p>Know a veteran who could use support? Tell us about them.</p>
    </div>
    <div id="submit-content" class="profile-content"></div>
  </section>
</main>
```

Replace with:

```html
  <section id="submit-view" class="view" hidden>
    <div class="page-heading">
      <h2>Submit a Veteran</h2>
      <p>Know a veteran who could use support? Tell us about them.</p>
    </div>
    <div id="submit-content" class="profile-content"></div>
  </section>

  <section id="served-view" class="view" hidden>
    <div class="page-heading">
      <h2>Veterans We've Served</h2>
      <p>Thanks to donors like you, these veterans have already been fully supported.</p>
    </div>
    <div id="served-grid" class="veteran-grid"></div>
  </section>
</main>
```

- [ ] **Step 5: Add the script tag to `index.html`**

Find:

```html
<script src="view-submit.js"></script>
<script src="app.js"></script>
```

Replace with:

```html
<script src="view-submit.js"></script>
<script src="view-served.js"></script>
<script src="app.js"></script>
```

- [ ] **Step 6: Append served-card style to `styles.css`**

Append to the end of `styles.css`:

```css

.served-outcome {
  color: #333;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}
```

- [ ] **Step 7: Manually verify**

Reload `index.html`. Edit the address bar to end in `#/served`.

Expected:
- A heading "Veterans We've Served" and four read-only cards (Hal Whitfield, Marjorie Simms, Louis Petrakis, Ruth Alden), each with an illustrated avatar, name, branch/era, an outcome sentence, and a "$X raised" total.
- Cards are not clickable (no navigation on click, no hover-lift behavior tied to a link).
- No console errors.

- [ ] **Step 8: Commit**

```bash
git add data.js view-served.js router.js index.html styles.css
git commit -m "Add Past Vets Served page"
```

---

### Task 6: Home page

**Files:**
- Create: `view-home.js`
- Modify: `router.js` (root `#/` renders home; add explicit `#/vets` route)
- Modify: `index.html` (add `#home-view` section, add heading to directory view, flip default-visible section, add script tag)
- Modify: `styles.css` (hero, how-it-works, featured-vets styles)

**Interfaces:**
- Consumes: `VETERANS`, `formatCurrency`, `avatarMarkup`, `buildVeteranCard` from earlier tasks; `#home-content` from `index.html`.
- Produces: `renderHome(): void` (consumed by `router.js`).

- [ ] **Step 1: Create `view-home.js`**

```js
function renderHome() {
  const container = document.getElementById("home-content");
  const featured = VETERANS.slice(0, 3);

  container.innerHTML =
    '<section class="hero">' +
      '<h2>Every veteran deserves to be seen.</h2>' +
      '<p class="hero-copy">' +
        'Tip a Vet is a nonprofit that connects everyday donors directly with veterans ' +
        'who need support &mdash; from veterans facing homelessness or gaps in benefits, ' +
        'to any veteran a community wants to say thank you to. Every tip goes straight ' +
        'to a real person\'s story, not overhead.' +
      '</p>' +
      '<a href="#/tip" class="confirm-button hero-cta">Tip a Vet a Buck</a>' +
    '</section>' +
    '<section class="how-it-works">' +
      '<div class="how-step">' +
        '<h3>1. Browse a vet</h3>' +
        '<p>Read a short story about a veteran we\'re supporting.</p>' +
      '</div>' +
      '<div class="how-step">' +
        '<h3>2. Send a tip</h3>' +
        '<p>Choose an amount, as little as a dollar.</p>' +
      '</div>' +
      '<div class="how-step">' +
        '<h3>3. It goes straight to them</h3>' +
        '<p>No middlemen, no overhead skimmed off your gift.</p>' +
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

- [ ] **Step 2: Replace `router.js`**

Replace the entire contents of `router.js` with:

```js
function showView(viewId) {
  document.querySelectorAll(".view").forEach(function (view) {
    view.hidden = view.id !== viewId;
  });
}

function router() {
  const hash = window.location.hash;
  const profileMatch = hash.match(/^#\/vets\/(.+)$/);
  const paymentMatch = hash.match(/^#\/tip\/(.+)$/);

  if (profileMatch) {
    const vet = findVeteran(profileMatch[1]);
    if (vet) {
      renderProfile(vet);
      showView("profile-view");
      return;
    }
  }

  if (hash === "#/tip") {
    renderPayment(null);
    showView("payment-view");
    return;
  }

  if (paymentMatch) {
    const vet = findVeteran(paymentMatch[1]);
    if (vet) {
      renderPayment(vet);
      showView("payment-view");
      return;
    }
  }

  if (hash === "#/vets") {
    renderDirectory();
    showView("directory-view");
    return;
  }

  if (hash === "#/submit") {
    renderSubmitForm();
    showView("submit-view");
    return;
  }

  if (hash === "#/served") {
    renderServedVets();
    showView("served-view");
    return;
  }

  renderHome();
  showView("home-view");
}

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
```

- [ ] **Step 3: Update `index.html`**

Find:

```html
<main id="app">
  <section id="directory-view" class="view">
    <div id="veteran-grid" class="veteran-grid"></div>
  </section>
```

Replace with:

```html
<main id="app">
  <section id="home-view" class="view">
    <div id="home-content"></div>
  </section>

  <section id="directory-view" class="view" hidden>
    <div class="page-heading">
      <h2>Browse Veterans</h2>
      <p>Every one of these veterans has a story. Pick one to learn more and send a tip.</p>
    </div>
    <div id="veteran-grid" class="veteran-grid"></div>
  </section>
```

- [ ] **Step 4: Add the script tag to `index.html`**

Find:

```html
<script src="view-served.js"></script>
<script src="app.js"></script>
```

Replace with:

```html
<script src="view-served.js"></script>
<script src="view-home.js"></script>
<script src="app.js"></script>
```

- [ ] **Step 5: Append home page styles to `styles.css`**

Append to the end of `styles.css`:

```css

.hero {
  text-align: center;
  padding: 2rem 1rem 3rem;
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
  color: #333;
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

.how-step p {
  color: #666;
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
```

- [ ] **Step 6: Manually verify**

Reload `index.html` (with no hash, i.e. the plain file path).

Expected:
- Lands on the Home view: hero headline, mission paragraph mentioning the nonprofit and helping veterans at risk/veterans generally, a gold "Tip a Vet a Buck" button, three "how it works" steps, a "Meet a few of the vets" strip with 3 featured cards, and a "See all vets →" link.
- Clicking the hero "Tip a Vet a Buck" button goes to `#/tip` with a random vet and $1 pre-selected.
- Clicking "See all vets" goes to `#/vets` and shows the full directory grid under a "Browse Veterans" heading.
- Editing the address bar to `#/vets` directly also works.
- No console errors.

- [ ] **Step 7: Commit**

```bash
git add view-home.js router.js index.html styles.css
git commit -m "Add home page, move directory to /vets"
```

---

### Task 7: Site-wide navigation

**Files:**
- Modify: `index.html` (replace header with nav bar markup)
- Modify: `app.js` (wire mobile nav toggle)
- Modify: `styles.css` (replace `.site-header` rule, append nav styles)

**Interfaces:**
- Consumes: nothing new (pure markup/wiring on top of all prior routes).
- Produces: none consumed by later tasks (final task).

- [ ] **Step 1: Replace the header in `index.html`**

Find:

```html
<header class="site-header">
  <h1>Tip a Vet</h1>
  <p class="tagline">Tip a Vet a Buck</p>
</header>
```

Replace with:

```html
<header class="site-header">
  <div class="header-bar">
    <a href="#/" class="brand"><h1>Tip a Vet</h1></a>
    <button type="button" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>
    <nav id="site-nav" class="site-nav">
      <a href="#/vets">Browse Vets</a>
      <a href="#/submit">Submit a Vet</a>
      <a href="#/served">Past Vets Served</a>
      <a href="#/tip" class="nav-tip-button">Tip a Vet a Buck</a>
    </nav>
  </div>
</header>
```

- [ ] **Step 2: Replace `app.js`**

Replace the entire contents of `app.js` with:

```js
document.getElementById("back-button").addEventListener("click", function () {
  window.location.hash = "#/";
});

document.getElementById("payment-back-button").addEventListener("click", function () {
  window.location.hash = "#/";
});

document.getElementById("nav-toggle").addEventListener("click", function () {
  const nav = document.getElementById("site-nav");
  const isOpen = nav.classList.toggle("open");
  document.getElementById("nav-toggle").setAttribute("aria-expanded", String(isOpen));
});

document.getElementById("site-nav").addEventListener("click", function (event) {
  if (event.target.tagName === "A") {
    document.getElementById("site-nav").classList.remove("open");
  }
});
```

- [ ] **Step 3: Replace the `.site-header` rules in `styles.css`**

Find:

```css
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
```

Replace with:

```css
.site-header {
  background-color: var(--color-navy);
  color: var(--color-cream);
  padding: 1.25rem 1rem;
}
```

- [ ] **Step 4: Append nav styles to `styles.css`**

Append to the end of `styles.css`:

```css

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
  color: var(--color-cream);
}

.brand h1 {
  font-size: 1.5rem;
  letter-spacing: 0.05em;
}

.nav-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--color-cream);
  font-size: 1.5rem;
  cursor: pointer;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.site-nav a {
  color: var(--color-cream);
  text-decoration: none;
  font-size: 0.95rem;
}

.site-nav a:hover {
  color: var(--color-gold);
}

.nav-tip-button {
  background-color: var(--color-gold);
  color: var(--color-navy-dark) !important;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: bold;
}

.nav-tip-button:hover {
  background-color: #d9b96e;
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

- [ ] **Step 5: Manually verify**

Reload `index.html`.

Expected:
- A compact navy nav bar: "Tip a Vet" brand (links to home) on the left, "Browse Vets" / "Submit a Vet" / "Past Vets Served" links and a gold "Tip a Vet a Buck" pill button on the right.
- Clicking each nav link navigates to the correct page (`#/vets`, `#/submit`, `#/served`, `#/tip`).
- Clicking the brand navigates to `#/`.
- Resize the browser window below ~640px wide (or use devtools responsive mode) — the nav links collapse behind a hamburger (☰) button; clicking it reveals the stacked nav links; clicking a link closes the menu again.
- No console errors.

- [ ] **Step 6: Commit**

```bash
git add index.html app.js styles.css
git commit -m "Add site-wide navigation header"
```
