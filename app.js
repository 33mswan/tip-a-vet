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
