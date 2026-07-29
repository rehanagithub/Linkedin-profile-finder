function normalize(str = "") {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
}

function tokenize(str = "") {
  return normalize(str).split(/\s+/).filter(Boolean);
}

/**
 * Scores a parsed profile against the original search criteria (0..1).
 * Weighted so that name/title/company matches count more than a loose
 * keyword hit, since those are the fields the user most likely cares about.
 */
function scoreProfile(profile, criteria) {
  const haystack = normalize(
    [profile.name, profile.jobTitle, profile.company, profile.location, profile.snippet]
      .filter(Boolean)
      .join(" ")
  );

  const weights = {
    name: 3,
    title: 2,
    company: 2,
    location: 1.5,
    industry: 1,
    keywords: 1,
  };

  let earned = 0;
  let possible = 0;

  Object.entries(weights).forEach(([field, weight]) => {
    const value = criteria[field];
    if (!value || !value.trim()) return;

    const tokens = tokenize(value);
    if (!tokens.length) return;

    possible += weight;
    const hits = tokens.filter((t) => haystack.includes(t)).length;
    earned += weight * (hits / tokens.length);
  });

  if (possible === 0) return 0.5; // no criteria to compare against
  return Math.round((earned / possible) * 100) / 100;
}

module.exports = { scoreProfile };
