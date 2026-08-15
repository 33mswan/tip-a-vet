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
