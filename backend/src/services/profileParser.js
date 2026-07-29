/**
 * Public LinkedIn profile pages that search engines index typically render
 * their <title> as one of:
 *   "Name - Title - Company | LinkedIn"
 *   "Name - Title at Company | LinkedIn"
 *   "Name | LinkedIn"
 * We parse only this already-public, already-indexed metadata — nothing is
 * fetched from linkedin.com itself.
 */
function parseTitle(rawTitle = "") {
  const cleaned = rawTitle.replace(/\s*\|\s*LinkedIn\s*$/i, "").trim();
  const segments = cleaned.split(" - ").map((s) => s.trim()).filter(Boolean);

  let name = segments[0] || null;
  let titleAndCompany = segments.slice(1).join(" - ") || "";

  let jobTitle = null;
  let company = null;

  const atMatch = titleAndCompany.match(/^(.*?)\s+at\s+(.*)$/i);
  if (atMatch) {
    jobTitle = atMatch[1].trim();
    company = atMatch[2].trim();
  } else if (titleAndCompany.includes(" - ")) {
    const [t, c] = titleAndCompany.split(" - ");
    jobTitle = t?.trim() || null;
    company = c?.trim() || null;
  } else if (titleAndCompany) {
    jobTitle = titleAndCompany;
  }

  return { name, jobTitle, company };
}

function guessLocation(snippet = "") {
  // Snippets on indexed LinkedIn profile pages often start with a location,
  // e.g. "Bengaluru, Karnataka, India · 500+ connections ..."
  const match = snippet.match(/^([A-Za-z\u00C0-\u024F .]+(?:,\s*[A-Za-z\u00C0-\u024F .]+){0,2})\s*(?:·|\.)/);
  return match ? match[1].trim() : null;
}

function parseSearchItem(item) {
  const { name, jobTitle, company } = parseTitle(item.title);
  return {
    name,
    jobTitle,
    company,
    location: guessLocation(item.snippet || ""),
    profileUrl: item.link,
    snippet: item.snippet || null,
  };
}

module.exports = { parseSearchItem, parseTitle, guessLocation };
