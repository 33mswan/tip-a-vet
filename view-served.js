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
