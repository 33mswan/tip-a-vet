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
      '<button type="submit" class="confirm-button">Add Vet</button>' +
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
      name: escapeHtml(name),
      branch: escapeHtml(branch),
      era: escapeHtml(era),
      bio: escapeHtml(bio),
      avatarInitials: initialsFromName(name),
      totalTipped: 0,
    };
    VETERANS.push(newVet);

    form.hidden = true;
    const success = document.getElementById("submit-success");
    success.hidden = false;
    success.innerHTML =
      '<p>Done &mdash; ' + escapeHtml(name) + '\'s on the list.</p>' +
      '<a class="confirm-button" href="#/vets/' + newVet.id + '">View their profile</a>';
  });
}
