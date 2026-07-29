
const axios = require("axios");

const SERPER_URL = "https://google.serper.dev/search";

// Normalize text
function normalize(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Normalize locations
function normalizeLocation(location = "") {
  const value = normalize(location);

  const map = {
    banglore: "bangalore",
    bengaluru: "bangalore",
    blr: "bangalore",
    hyd: "hyderabad",
    hyderabad: "hyderabad",
    bombay: "mumbai",
    madras: "chennai",
    chennai: "chennai",
    pune: "pune",
    mumbai: "mumbai",
    delhi: "delhi",
    
  };

  return map[value] || value;
}

// Build search query (Compatible with Serper FREE)
function buildQuery(criteria = {}) {
  const {
    name = "",
    title = "",
    company = "",
    location = "",
  } = criteria;

  const parts = ["LinkedIn"];

  if (name.trim()) parts.push(name.trim());
  if (title.trim()) parts.push(title.trim());
  if (company.trim()) parts.push(company.trim());
  if (location.trim()) parts.push(normalizeLocation(location));

  return parts.join(" ");
}

// Calculate score
function calculateScore(profile, criteria) {
  let score = 0;

  const text = normalize(`${profile.title} ${profile.snippet}`);

  if (criteria.name) {
    if (text.includes(normalize(criteria.name))) score += 40;
  }

  if (criteria.title) {
    if (text.includes(normalize(criteria.title))) score += 30;
  }

  if (criteria.company) {
    if (text.includes(normalize(criteria.company))) score += 20;
  }

  if (criteria.location) {
    const location = normalizeLocation(criteria.location);

    if (
      location === "bangalore" &&
      (text.includes("bangalore") || text.includes("bengaluru"))
    ) {
      score += 10;
    } else if (text.includes(location)) {
      score += 10;
    }
  }

  return score;
}

// Remove duplicate profiles
function removeDuplicates(profiles) {
  const seen = new Set();

  return profiles.filter((profile) => {
    if (seen.has(profile.linkedinUrl)) {
      return false;
    }

    seen.add(profile.linkedinUrl);
    return true;
  });
}

async function searchLinkedInProfiles(criteria = {}) {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    throw new Error("SERPER_API_KEY missing");
  }

  const query = buildQuery(criteria);

  console.log("Generated Query:", query);

  try {
    const response = await axios.post(
      SERPER_URL,
      {
        q: query,
        num: 50,
      },
      {
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    const results = response.data.organic || [];

    let profiles = results
      // Keep only LinkedIn profile URLs
      .filter(
        (item) =>
          item.link &&
          item.link.includes("linkedin.com/in")
      )
      .map((item) => {
        const profile = {
          name: item.title || "",
          title: item.title || "",
          jobTitle: item.title || "",
          company: "",
          location: "",
          linkedinUrl: item.link,
          profileUrl: item.link,
          snippet: item.snippet || "",
          description: item.snippet || "",
        };

        return {
          ...profile,
          relevance: calculateScore(profile, criteria),
        };
      });

    profiles = removeDuplicates(profiles);

    profiles = profiles.filter((profile) => profile.relevance >= 30);

    profiles.sort((a, b) => b.relevance - a.relevance);

    return {
      query,
      totalResults: profiles.length,
      profiles,
    };
  } catch (error) {
    console.error(
      "Serper Error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        "Unable to search LinkedIn profiles"
    );
  }
}

module.exports = {
  searchLinkedInProfiles,
  buildQuery,
};