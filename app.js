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
