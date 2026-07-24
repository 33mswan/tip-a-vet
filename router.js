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
