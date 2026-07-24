function renderHome() {
  const container = document.getElementById("home-content");
  const featured = VETERANS.slice(0, 3);

  container.innerHTML =
    '<section class="hero">' +
      '<h2>Every veteran deserves to be seen.</h2>' +
      '<p class="hero-copy">' +
        'Tip a Vet is a nonprofit that connects everyday donors directly with veterans ' +
        'who need support &mdash; from veterans facing homelessness or gaps in benefits, ' +
        'to any veteran a community wants to say thank you to. Every tip goes straight ' +
        'to a real person\'s story, not overhead.' +
      '</p>' +
      '<a href="#/tip" class="confirm-button hero-cta">Tip a Vet a Buck</a>' +
    '</section>' +
    '<section class="how-it-works">' +
      '<div class="how-step">' +
        '<h3>1. Browse a vet</h3>' +
        '<p>Read a short story about a veteran we\'re supporting.</p>' +
      '</div>' +
      '<div class="how-step">' +
        '<h3>2. Send a tip</h3>' +
        '<p>Choose an amount, as little as a dollar.</p>' +
      '</div>' +
      '<div class="how-step">' +
        '<h3>3. It goes straight to them</h3>' +
        '<p>No middlemen, no overhead skimmed off your gift.</p>' +
      '</div>' +
    '</section>' +
    '<section class="featured-vets">' +
      '<h3>Meet a few of the vets</h3>' +
      '<div class="veteran-grid" id="featured-grid"></div>' +
      '<a href="#/vets" class="see-all-link">See all vets &rarr;</a>' +
    '</section>';

  const featuredGrid = document.getElementById("featured-grid");
  featured.forEach(function (vet) {
    featuredGrid.appendChild(buildVeteranCard(vet));
  });
}
