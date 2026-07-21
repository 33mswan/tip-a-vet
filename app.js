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

function showView(viewId) {
  document.querySelectorAll(".view").forEach(function (view) {
    view.hidden = view.id !== viewId;
  });
}

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
