const VETERANS = [
  {
    id: "v1",
    name: "James \"Jimmy\" Doyle",
    branch: "Army",
    era: "WWII",
    bio: "Landed at Normandy with the 29th Infantry Division. After the war, ran a hardware store in his hometown for thirty years and never missed a Memorial Day parade.",
    avatarInitials: "JD",
    totalTipped: 0,
  },
  {
    id: "v2",
    name: "Eleanor Marsh",
    branch: "Navy",
    era: "WWII",
    bio: "Served as a Navy WAVE, decoding communications out of a small office in Washington, D.C. Loved to tell stories about the other women in her unit.",
    avatarInitials: "EM",
    totalTipped: 0,
  },
  {
    id: "v3",
    name: "Robert \"Bobby\" Alvarez",
    branch: "Marines",
    era: "Vietnam",
    bio: "Two tours as a radio operator with the 1st Marine Division. Now volunteers weekly at the local VA hospital, checking in on newer veterans.",
    avatarInitials: "RA",
    totalTipped: 0,
  },
  {
    id: "v4",
    name: "Patricia \"Pat\" Nguyen",
    branch: "Air Force",
    era: "Gulf War",
    bio: "Flew logistics missions during Desert Storm. Studied aerospace engineering afterward and taught high school physics for two decades.",
    avatarInitials: "PN",
    totalTipped: 0,
  },
  {
    id: "v5",
    name: "Walter \"Walt\" Higgins",
    branch: "Army",
    era: "Korea",
    bio: "Fought through the Chosin Reservoir campaign with the 7th Infantry Division. Still meets his old unit for breakfast every first Sunday of the month.",
    avatarInitials: "WH",
    totalTipped: 0,
  },
  {
    id: "v6",
    name: "Diane Okafor",
    branch: "Coast Guard",
    era: "Gulf War",
    bio: "Ran search-and-rescue operations off the Atlantic coast. Now coaches a youth rowing team on weekends.",
    avatarInitials: "DO",
    totalTipped: 0,
  },
];

const TIPS = [];

function formatCurrency(amount) {
  return "$" + amount.toFixed(0);
}

function findVeteran(id) {
  return VETERANS.find(function (v) { return v.id === id; });
}

function sendTip(veteranId, amount) {
  const vet = findVeteran(veteranId);
  vet.totalTipped += amount;
  TIPS.push({
    id: "t" + (TIPS.length + 1),
    veteranId: veteranId,
    amount: amount,
    timestamp: new Date().toISOString(),
  });
  return vet.totalTipped;
}
