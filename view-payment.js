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
