function seededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return function () {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

const AVATAR_SKIN_TONES = ["#f2d3b3", "#e8b48c", "#c68863", "#8d5a3b", "#5c3a21"];
const AVATAR_HAIR_COLORS = ["#2b1b0e", "#5c3a21", "#8a6d3b", "#c9a35a", "#4a4a4a", "#1c1c1c"];

function generateAvatarSVG(seed) {
  const rand = seededRandom(seed);
  const skin = AVATAR_SKIN_TONES[Math.floor(rand() * AVATAR_SKIN_TONES.length)];
  const hair = AVATAR_HAIR_COLORS[Math.floor(rand() * AVATAR_HAIR_COLORS.length)];
  const hairStyle = Math.floor(rand() * 3);
  const mouthCurve = rand() > 0.5 ? 8 : 2;

  let hairShape = "";
  if (hairStyle === 0) {
    hairShape = '<path d="M20 45 Q50 5 80 45 L80 35 Q50 15 20 35 Z" fill="' + hair + '" />';
  } else if (hairStyle === 2) {
    hairShape = '<path d="M15 55 Q15 10 50 10 Q85 10 85 55 L78 55 Q78 25 50 22 Q22 25 22 55 Z" fill="' + hair + '" />';
  }

  return (
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustrated avatar">' +
      '<circle cx="50" cy="50" r="50" fill="#e7e2d4" />' +
      '<circle cx="50" cy="46" r="26" fill="' + skin + '" />' +
      '<rect x="38" y="64" width="24" height="20" fill="' + skin + '" />' +
      '<path d="M20 100 Q20 68 50 68 Q80 68 80 100 Z" fill="#0b2545" />' +
      hairShape +
      '<circle cx="41" cy="44" r="2.5" fill="#1c1c1c" />' +
      '<circle cx="59" cy="44" r="2.5" fill="#1c1c1c" />' +
      '<path d="M42 56 Q50 ' + (56 + mouthCurve) + ' 58 56" stroke="#7a4a3a" stroke-width="2" fill="none" stroke-linecap="round" />' +
    '</svg>'
  );
}

function avatarMarkup(seed, sizeClass) {
  return '<div class="avatar ' + sizeClass + '">' + generateAvatarSVG(seed) + '</div>';
}
