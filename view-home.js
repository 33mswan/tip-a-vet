function renderHome() {
  const container = document.getElementById("home-content");
  const featured = VETERANS.slice(0, 3);

  container.innerHTML =
    '<section class="hero">' +
      '<h2>Every veteran deserves to be seen.</h2>' +
      '<p class="hero-copy">' +
        'Send a vet a few bucks. Straight from you to them &mdash; ' +
        'no middleman, just a small processing fee.' +
      '</p>' +
      '<a href="#/tip" class="confirm-button hero-cta">Tip a Vet a Buck</a>' +
    '</section>' +
    '<section class="how-it-works">' +
      '<div class="how-step">' +
        '<h3><span class="star-bullet">&#9733;</span>Find a vet</h3>' +
        '<p>Browse a few names and pick someone.</p>' +
      '</div>' +
      '<div class="how-step">' +
        '<h3><span class="star-bullet">&#9733;</span>Send a tip</h3>' +
        '<p>Choose an amount, as little as a dollar.</p>' +
      '</div>' +
      '<div class="how-step">' +
        '<h3><span class="star-bullet">&#9733;</span>It goes straight to them</h3>' +
        '<p>Minus a small processing fee.</p>' +
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
