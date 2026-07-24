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
