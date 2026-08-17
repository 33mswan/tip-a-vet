function renderProfile(vet) {
  const content = document.getElementById("profile-content");
  content.innerHTML =
    '<div class="profile-header-row">' +
      avatarMarkup(vet.id, "avatar-large") +
      '<div>' +
        '<h2 class="veteran-name">' + vet.name + '</h2>' +
        '<p class="veteran-meta">' + vet.branch + ' &middot; ' + vet.era + '</p>' +
      '</div>' +
    '</div>' +
    '<p class="veteran-bio">' + vet.bio + '</p>' +
    '<p class="veteran-total" id="profile-total">' + formatCurrency(vet.totalTipped) + ' tipped</p>' +
    '<a class="confirm-button" href="#/tip/' + vet.id + '">Send $</a>';
}
