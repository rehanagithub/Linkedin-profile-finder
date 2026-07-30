// const axios = require("axios");

 const SERPER_URL = "https://google.serper.dev/search";

// // ---------------------------------------------------------------------------
// // Text helpers
// // ---------------------------------------------------------------------------

// // Normalize text
// function normalize(value = "") {
//   return value
//     .toLowerCase()
//     .replace(/[^a-z0-9 ]/g, "")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// // Normalize locations
// function normalizeLocation(location = "") {
//   const value = normalize(location);

//   const map = {
//     banglore: "bangalore",
//     bengaluru: "bangalore",
//     blr: "bangalore",
//     hyd: "hyderabad",
//     hyderabad: "hyderabad",
//     bombay: "mumbai",
//     madras: "chennai",
//     chennai: "chennai",
//     pune: "pune",
//     mumbai: "mumbai",
//     delhi: "delhi",
//   };

//   return map[value] || value;
// }

// // ---------------------------------------------------------------------------
// // Query building — now generates MULTIPLE variants of the search query
// // instead of a single fixed one. Different phrasings surface different
// // slices of Google's index via Serper, which is the main lever for getting
// // more unique results without relying purely on pagination (which some
// // plans/queries return overlapping pages for).
// // ---------------------------------------------------------------------------

// function buildQuery(criteria = {}) {
//   const {
//     name = "",
//     title = "",
//     company = "",
//     location = "",
//   } = criteria;

//   const parts = ["LinkedIn"];

//   if (name.trim()) parts.push(name.trim());
//   if (title.trim()) parts.push(title.trim());
//   if (company.trim()) parts.push(company.trim());
//   if (location.trim()) parts.push(normalizeLocation(location));

//   return parts.join(" ");
// }

// // Builds several distinct query variants for the same criteria.
// // Each variant is worded/structured differently so Serper/Google
// // surfaces a different slice of indexed profiles for each one.
// function buildQueryVariants(criteria = {}) {
//   const {
//     name = "",
//     title = "",
//     company = "",
//     location = "",
//   } = criteria;

//   const cleanName = name.trim();
//   const cleanTitle = title.trim();
//   const cleanCompany = company.trim();
//   const cleanLocation = location.trim() ? normalizeLocation(location) : "";

//   const variants = new Set();

//   // Variant 1: the original baseline query
//   variants.add(buildQuery(criteria));

//   // Variant 2: site-restricted search (forces Google to bias toward
//   // linkedin.com/in pages directly, rather than mixing in job boards etc.)
//   {
//     const parts = ["site:linkedin.com/in"];
//     if (cleanName) parts.push(cleanName);
//     if (cleanTitle) parts.push(`"${cleanTitle}"`);
//     if (cleanCompany) parts.push(cleanCompany);
//     if (cleanLocation) parts.push(cleanLocation);
//     variants.add(parts.join(" "));
//   }

//   // Variant 3: quoted title phrase without the "LinkedIn" keyword prefix,
//   // reordered so location leads — surfaces different ranking from Google
//   if (cleanTitle) {
//     const parts = [];
//     if (cleanLocation) parts.push(cleanLocation);
//     parts.push(`"${cleanTitle}"`);
//     if (cleanCompany) parts.push(cleanCompany);
//     parts.push("linkedin profile");
//     variants.add(parts.join(" "));
//   }

//   // Variant 4: broader/looser phrasing, no quotes, "developer"/"engineer"
//   // style synonyms left to Google's own matching rather than forcing exact
//   // phrase — helps catch profiles worded slightly differently
//   {
//     const parts = ["linkedin"];
//     if (cleanTitle) parts.push(cleanTitle);
//     if (cleanLocation) parts.push(cleanLocation);
//     if (cleanCompany) parts.push(cleanCompany);
//     if (cleanName) parts.push(cleanName);
//     variants.add(parts.join(" "));
//   }

//   return Array.from(variants).filter(Boolean);
// }

// // ---------------------------------------------------------------------------
// // Relevance scoring
// // ---------------------------------------------------------------------------

// // Returns a 0..1 score representing how many words of `query`
// // appear inside `text`. Handles partial/word-level matches instead
// // of requiring the full phrase to appear verbatim.
// function partialMatchRatio(text, query) {
//   const words = normalize(query).split(" ").filter(Boolean);
//   if (words.length === 0) return 0;

//   const matchedWords = words.filter((w) => text.includes(w));
//   return matchedWords.length / words.length;
// }

// // Calculate score (uses partial credit instead of all-or-nothing)
// function calculateScore(profile, criteria) {
//   let score = 0;

//   const text = normalize(`${profile.title} ${profile.snippet}`);

//   // Name: keep this stricter since names are usually short and exact
//   if (criteria.name) {
//     const ratio = partialMatchRatio(text, criteria.name);
//     score += ratio * 40;
//   }

//   // Title: partial credit for word overlap
//   // e.g. searching "Software Engineer" still matches
//   // "Senior Software Engineer" or "Software Development Engineer"
//   if (criteria.title) {
//     const ratio = partialMatchRatio(text, criteria.title);
//     score += ratio * 30;
//   }

//   // Company: partial credit for word overlap
//   if (criteria.company) {
//     const ratio = partialMatchRatio(text, criteria.company);
//     score += ratio * 20;
//   }

//   // Location: keep alias-aware exact-ish matching, but don't
//   // require it to be the only thing keeping a profile alive
//   if (criteria.location) {
//     const location = normalizeLocation(criteria.location);

//     if (
//       location === "bangalore" &&
//       (text.includes("bangalore") || text.includes("bengaluru"))
//     ) {
//       score += 10;
//     } else if (text.includes(location)) {
//       score += 10;
//     }
//   }

//   return Math.round(score);
// }

// // ---------------------------------------------------------------------------
// // Field extraction from snippet text
// // Google/Serper snippets for LinkedIn profiles are often semi-structured,
// // e.g.:
// //   "Software Engineer · Experience: Google DeepMind · Education: UCL ·
// //    Location: London · 365 connections on LinkedIn."
// // or
// //   "Staff Software Engineer. Elastic Path. Jul 2023 - Present 3 years 1
// //    month. Stirling, Scotland, United Kingdom."
// // We try to pull out company/location/education where the pattern is
// // recognizable, falling back to empty strings when it isn't.
// // ---------------------------------------------------------------------------

// function extractField(snippet, label) {
//   // Matches "Label: value" up to the next " · " or end of string
//   const regex = new RegExp(`${label}:\\s*([^\\u00b7]+)`, "i");
//   const match = snippet.match(regex);
//   return match ? match[1].trim().replace(/\.$/, "") : "";
// }

// function extractLocationFallback(snippet) {
//   // Looks for a trailing "City, Region, Country" style fragment, common in
//   // non-structured LinkedIn snippets (e.g. "... Stirling, Scotland, United
//   // Kingdom.")
//   const match = snippet.match(
//     /([A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*,\s[A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*(?:,\s[A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*)?)/
//   );
//   return match ? match[1].trim() : "";
// }

// function enrichProfileFields(profile) {
//   const snippet = profile.snippet || "";

//   const company = extractField(snippet, "Experience") || "";
//   const education = extractField(snippet, "Education") || "";
//   const structuredLocation = extractField(snippet, "Location");
//   const location = structuredLocation || extractLocationFallback(snippet);

//   return {
//     ...profile,
//     company: profile.company || company,
//     education: profile.education || education,
//     location: profile.location || location,
//   };
// }

// // ---------------------------------------------------------------------------
// // Dedup
// // ---------------------------------------------------------------------------

// function removeDuplicates(profiles) {
//   const seen = new Set();

//   return profiles.filter((profile) => {
//     if (seen.has(profile.linkedinUrl)) {
//       return false;
//     }

//     seen.add(profile.linkedinUrl);
//     return true;
//   });
// }

// // ---------------------------------------------------------------------------
// // Serper fetch
// // ---------------------------------------------------------------------------

// // Fetch a single page of results from Serper for a given query string
// async function fetchSerperPage(query, apiKey, page) {
//   const response = await axios.post(
//     SERPER_URL,
//     {
//       q: query,
//       num: 10, // Serper's practical cap per page on most plans
//       page,
//     },
//     {
//       headers: {
//         "X-API-KEY": apiKey,
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   return response.data.organic || [];
// }

// // ---------------------------------------------------------------------------
// // Main search function
// // ---------------------------------------------------------------------------

// async function searchLinkedInProfiles(criteria = {}, options = {}) {
//   const apiKey = process.env.SERPER_API_KEY;

//   if (!apiKey) {
//     throw new Error("SERPER_API_KEY missing");
//   }

//   // Multiple differently-worded queries instead of one fixed query.
//   const queryVariants = buildQueryVariants(criteria);
//   const primaryQuery = queryVariants[0];

//   // How many pages of 10 per *variant*. Total requests = variants * pages.
//   // e.g. 4 variants * 3 pages = 12 requests, up to ~120 raw results before
//   // filtering/dedup.
//   const PAGES_PER_VARIANT = options.pagesPerVariant || 3;

//   console.log("Query variants:", queryVariants);

//   try {
//     const requests = [];
//     queryVariants.forEach((variantQuery) => {
//       for (let page = 1; page <= PAGES_PER_VARIANT; page++) {
//         requests.push(
//           fetchSerperPage(variantQuery, apiKey, page).catch((err) => {
//             // Don't let one failing variant/page kill the whole search
//             console.error(
//               `Serper request failed for query "${variantQuery}" page ${page}:`,
//               err.response?.data || err.message
//             );
//             return [];
//           })
//         );
//       }
//     });

//     const pageResults = await Promise.all(requests);
//     const results = pageResults.flat();

//     let profiles = results
//       // Keep only LinkedIn profile URLs
//       .filter((item) => item.link && item.link.includes("linkedin.com/in"))
//       .map((item) => {
//         const profile = {
//           name: item.title || "",
//           title: item.title || "",
//           jobTitle: item.title || "",
//           company: "",
//           location: "",
//           education: "",
//           linkedinUrl: item.link,
//           profileUrl: item.link,
//           snippet: item.snippet || "",
//           description: item.snippet || "",
//         };

//         const enriched = enrichProfileFields(profile);

//         return {
//           ...enriched,
//           relevance: calculateScore(enriched, criteria),
//         };
//       });

//     profiles = removeDuplicates(profiles);

//     // No hard relevance cutoff — every valid LinkedIn profile found is
//     // kept, just sorted so the best matches appear first. Uncomment below
//     // if you want to filter out very obviously unrelated (0-score) hits:
//     // profiles = profiles.filter((profile) => profile.relevance > 0);

//     profiles.sort((a, b) => b.relevance - a.relevance);

//     return {
//       query: primaryQuery,
//       queryVariants,
//       totalResults: profiles.length,
//       profiles,
//     };
//   } catch (error) {
//     console.error("Serper Error:", error.response?.data || error.message);

//     throw new Error(
//       error.response?.data?.message || "Unable to search LinkedIn profiles"
//     );
//   }
// }

// module.exports = {
//   searchLinkedInProfiles,
//   buildQuery,
//   buildQueryVariants,
// };

// const axios = require("axios");

// const SERPER_URL = "https://google.serper.dev/search";

// // ---------------------------------------------------------------------------
// // Text helpers
// // ---------------------------------------------------------------------------


// function normalize(value = "") {
//   return value
//     .toLowerCase()
//     .replace(/[^a-z0-9 ]/g, "")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// function normalizeLocation(location = "") {
//   const value = normalize(location);

//   const map = {
//     banglore: "bangalore",
//     bengaluru: "bangalore",
//     blr: "bangalore",
//     hyd: "hyderabad",
//     hyderabad: "hyderabad",
//     bombay: "mumbai",
//     madras: "chennai",
//     chennai: "chennai",
//     pune: "pune",
//     mumbai: "mumbai",
//     delhi: "delhi",
//     ncr: "delhi",
//     gurgaon: "gurugram",
//     gurugram: "gurugram",
//   };

//   return map[value] || value;
// }

// // Common job title synonyms. Extend this map as you notice more patterns
// // in your own data (e.g. add "data scientist" -> ["data analyst", ...]).
// const TITLE_SYNONYMS = {
//   "software engineer": ["software developer", "sde", "swe"],
//   "software developer": ["software engineer", "sde"],
//   "data scientist": ["data analyst", "ml engineer", "machine learning engineer"],
//   "product manager": ["product owner", "pm"],
//   "frontend developer": ["front end engineer", "ui developer", "react developer"],
//   "backend developer": ["back end engineer", "server side developer"],
//   "full stack developer": ["full stack engineer", "fullstack developer"],
//   "devops engineer": ["site reliability engineer", "sre", "cloud engineer"],
//   "hr manager": ["human resources manager", "hr business partner"],
//   "sales executive": ["sales representative", "business development executive"],
// };

// function getTitleSynonyms(title) {
//   const key = normalize(title);
//   return TITLE_SYNONYMS[key] || [];
// }

// // Broader region for a given city, used to widen location-based variants
// const LOCATION_BROADENING = {
//   bangalore: "karnataka india",
//   hyderabad: "telangana india",
//   mumbai: "maharashtra india",
//   pune: "maharashtra india",
//   chennai: "tamil nadu india",
//   delhi: "delhi ncr india",
//   gurugram: "haryana india",
// };

// // ---------------------------------------------------------------------------
// // Query building
// // ---------------------------------------------------------------------------

// function buildQuery(criteria = {}) {
//   const { name = "", title = "", company = "", location = "" } = criteria;

//   const parts = ["LinkedIn"];

//   if (name.trim()) parts.push(name.trim());
//   if (title.trim()) parts.push(title.trim());
//   if (company.trim()) parts.push(company.trim());
//   if (location.trim()) parts.push(normalizeLocation(location));

//   return parts.join(" ");
// }

// // Builds several distinct query variants for the same criteria, including
// // title synonyms and broadened location phrasing, so Serper surfaces a
// // wider, more diverse slice of indexed profiles.
// function buildQueryVariants(criteria = {}) {
//   const { name = "", title = "", company = "", location = "" } = criteria;

//   const cleanName = name.trim();
//   const cleanTitle = title.trim();
//   const cleanCompany = company.trim();
//   const cleanLocation = location.trim() ? normalizeLocation(location) : "";
//   const broadLocation = cleanLocation ? LOCATION_BROADENING[cleanLocation] : "";

//   const variants = new Set();

//   // 1. Baseline
//   variants.add(buildQuery(criteria));

//   // 2. site: restricted, quoted title
//   {
//     const parts = ["site:linkedin.com/in"];
//     if (cleanName) parts.push(cleanName);
//     if (cleanTitle) parts.push(`"${cleanTitle}"`);
//     if (cleanCompany) parts.push(cleanCompany);
//     if (cleanLocation) parts.push(cleanLocation);
//     variants.add(parts.join(" "));
//   }

//   // 3. Location-led, quoted title, no "LinkedIn" prefix
//   if (cleanTitle) {
//     const parts = [];
//     if (cleanLocation) parts.push(cleanLocation);
//     parts.push(`"${cleanTitle}"`);
//     if (cleanCompany) parts.push(cleanCompany);
//     parts.push("linkedin profile");
//     variants.add(parts.join(" "));
//   }

//   // 4. Loose phrasing, no quotes
//   {
//     const parts = ["linkedin"];
//     if (cleanTitle) parts.push(cleanTitle);
//     if (cleanLocation) parts.push(cleanLocation);
//     if (cleanCompany) parts.push(cleanCompany);
//     if (cleanName) parts.push(cleanName);
//     variants.add(parts.join(" "));
//   }

//   // 5. Title synonym variants
//   getTitleSynonyms(cleanTitle).forEach((synonym) => {
//     const parts = ["site:linkedin.com/in", `"${synonym}"`];
//     if (cleanCompany) parts.push(cleanCompany);
//     if (cleanLocation) parts.push(cleanLocation);
//     variants.add(parts.join(" "));
//   });

//   // 6. Broadened location (state/region instead of city)
//   if (broadLocation && cleanTitle) {
//     variants.add(`site:linkedin.com/in "${cleanTitle}" ${broadLocation}`);
//   }

//   // 7. Company-led variant (useful when company is a strong signal)
//   if (cleanCompany) {
//     const parts = ["site:linkedin.com/in", cleanCompany];
//     if (cleanTitle) parts.push(cleanTitle);
//     if (cleanLocation) parts.push(cleanLocation);
//     variants.add(parts.join(" "));
//   }

//   return Array.from(variants).filter(Boolean);
// }

// // ---------------------------------------------------------------------------
// // Relevance scoring
// // ---------------------------------------------------------------------------

// function partialMatchRatio(text, query) {
//   const words = normalize(query).split(" ").filter(Boolean);
//   if (words.length === 0) return 0;

//   const matchedWords = words.filter((w) => text.includes(w));
//   return matchedWords.length / words.length;
// }

// function calculateScore(profile, criteria) {
//   let score = 0;
//   const text = normalize(`${profile.title} ${profile.snippet}`);

//   if (criteria.name) {
//     score += partialMatchRatio(text, criteria.name) * 40;
//   }

//   if (criteria.title) {
//     // Give credit if the exact title OR any known synonym matches
//     const directRatio = partialMatchRatio(text, criteria.title);
//     const synonymRatios = getTitleSynonyms(criteria.title).map((syn) =>
//       partialMatchRatio(text, syn)
//     );
//     const bestRatio = Math.max(directRatio, ...synonymRatios, 0);
//     score += bestRatio * 30;
//   }

//   if (criteria.company) {
//     score += partialMatchRatio(text, criteria.company) * 20;
//   }

//   if (criteria.location) {
//     const location = normalizeLocation(criteria.location);
//     if (
//       location === "bangalore" &&
//       (text.includes("bangalore") || text.includes("bengaluru"))
//     ) {
//       score += 10;
//     } else if (text.includes(location)) {
//       score += 10;
//     } else {
//       // Partial credit if the broadened region (state/country) appears
//       const broad = LOCATION_BROADENING[location];
//       if (broad && broad.split(" ").some((w) => text.includes(w))) {
//         score += 5;
//       }
//     }
//   }

//   return Math.round(score);
// }

// // ---------------------------------------------------------------------------
// // Field extraction from snippet text
// // ---------------------------------------------------------------------------

// function extractField(snippet, label) {
//   const regex = new RegExp(`${label}:\\s*([^\\u00b7]+)`, "i");
//   const match = snippet.match(regex);
//   return match ? match[1].trim().replace(/\.$/, "") : "";
// }

// function extractLocationFallback(snippet) {
//   const match = snippet.match(
//     /([A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*,\s[A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*(?:,\s[A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*)?)/
//   );
//   return match ? match[1].trim() : "";
// }

// function enrichProfileFields(profile) {
//   const snippet = profile.snippet || "";

//   const company = extractField(snippet, "Experience") || "";
//   const education = extractField(snippet, "Education") || "";
//   const structuredLocation = extractField(snippet, "Location");
//   const location = structuredLocation || extractLocationFallback(snippet);

//   return {
//     ...profile,
//     company: profile.company || company,
//     education: profile.education || education,
//     location: profile.location || location,
//   };
// }

// // ---------------------------------------------------------------------------
// // Dedup
// // ---------------------------------------------------------------------------

// function removeDuplicates(profiles) {
//   const seen = new Set();
//   return profiles.filter((profile) => {
//     if (seen.has(profile.linkedinUrl)) return false;
//     seen.add(profile.linkedinUrl);
//     return true;
//   });
// }

// // ---------------------------------------------------------------------------
// // Serper fetch
// // ---------------------------------------------------------------------------

// async function fetchSerperPage(query, apiKey, page) {
//   const response = await axios.post(
//     SERPER_URL,
//     { q: query, num: 10, page },
//     {
//       headers: {
//         "X-API-KEY": apiKey,
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   return response.data.organic || [];
// }

// // ---------------------------------------------------------------------------
// // Main search function
// // ---------------------------------------------------------------------------

// async function searchLinkedInProfiles(criteria = {}, options = {}) {
//   const apiKey = process.env.SERPER_API_KEY;

//   if (!apiKey) {
//     throw new Error("SERPER_API_KEY missing");
//   }

//   const queryVariants = buildQueryVariants(criteria);
//   const primaryQuery = queryVariants[0];

//   // Total Serper requests = variants * pagesPerVariant.
//   // Default: ~6-8 variants * 3 pages = 18-24 requests per search.
//   const PAGES_PER_VARIANT = options.pagesPerVariant || 3;

//   // How many criteria fields were actually provided
//   const criteriaFieldCount = ["name", "title", "company", "location"].filter(
//     (f) => (criteria[f] || "").trim()
//   ).length;

//   // Accuracy floor: require at least a partial match on the given criteria
//   // rather than showing 0-relevance noise. Scales with how many fields
//   // were provided, so a single-field search isn't held to an unreasonably
//   // high bar.
//   const MIN_RELEVANCE =
//     options.minRelevance != null
//       ? options.minRelevance
//       : Math.max(5, criteriaFieldCount * 5);

//   // Cap on how many results to return, so the response stays a curated
//   // top-N rather than every single thing that scraped past the floor.
//   const MAX_RESULTS = options.maxResults || 60;

//   console.log("Query variants:", queryVariants);
//   console.log("Min relevance floor:", MIN_RELEVANCE);

//   try {
//     const requests = [];
//     queryVariants.forEach((variantQuery) => {
//       for (let page = 1; page <= PAGES_PER_VARIANT; page++) {
//         requests.push(
//           fetchSerperPage(variantQuery, apiKey, page).catch((err) => {
//             console.error(
//               `Serper request failed for "${variantQuery}" page ${page}:`,
//               err.response?.data || err.message
//             );
//             return [];
//           })
//         );
//       }
//     });

//     const pageResults = await Promise.all(requests);
//     const results = pageResults.flat();

//     let profiles = results
//       .filter((item) => item.link && item.link.includes("linkedin.com/in"))
//       .map((item) => {
//         const profile = {
//           name: item.title || "",
//           title: item.title || "",
//           jobTitle: item.title || "",
//           company: "",
//           location: "",
//           education: "",
//           linkedinUrl: item.link,
//           profileUrl: item.link,
//           snippet: item.snippet || "",
//           description: item.snippet || "",
//         };

//         const enriched = enrichProfileFields(profile);

//         return {
//           ...enriched,
//           relevance: calculateScore(enriched, criteria),
//         };
//       });

//     profiles = removeDuplicates(profiles);

//     const totalBeforeFilter = profiles.length;

//     // Accuracy filter: keep only profiles that meaningfully match at
//     // least some of what was searched for.
//     profiles = profiles.filter((profile) => profile.relevance >= MIN_RELEVANCE);

//     profiles.sort((a, b) => b.relevance - a.relevance);

//     const truncated = profiles.length > MAX_RESULTS;
//     profiles = profiles.slice(0, MAX_RESULTS);

//     console.log(
//       `Raw LinkedIn links: ${totalBeforeFilter} -> after relevance floor: ${profiles.length}${
//         truncated ? ` (capped at ${MAX_RESULTS})` : ""
//       }`
//     );

//     return {
//       query: primaryQuery,
//       queryVariants,
//       totalResults: profiles.length,
//       profiles,
//     };
//   } catch (error) {
//     console.error("Serper Error:", error.response?.data || error.message);
//     throw new Error(
//       error.response?.data?.message || "Unable to search LinkedIn profiles"
//     );
//   }
// }

// module.exports = {
//   searchLinkedInProfiles,
//   buildQuery,
//   buildQueryVariants,
//   calculateScore,
// };



// const axios = require("axios");

// const SERPAPI_URL = "https://serpapi.com/search.json";

// // ---------------------------------------------------------------------------
// // Text helpers
// // ---------------------------------------------------------------------------

// function normalize(value = "") {
//   return value
//     .toLowerCase()
//     .replace(/[^a-z0-9 ]/g, "")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// function normalizeLocation(location = "") {
//   const value = normalize(location);

//   const map = {
//     banglore: "bangalore",
//     bengaluru: "bangalore",
//     blr: "bangalore",
//     hyd: "hyderabad",
//     hyderabad: "hyderabad",
//     bombay: "mumbai",
//     madras: "chennai",
//     chennai: "chennai",
//     pune: "pune",
//     mumbai: "mumbai",
//     delhi: "delhi",
//     ncr: "delhi",
//     gurgaon: "gurugram",
//     gurugram: "gurugram",
//   };

//   return map[value] || value;
// }

// // Common job title synonyms. Extend this map as you notice more patterns
// // in your own data (e.g. add "data scientist" -> ["data analyst", ...]).
// const TITLE_SYNONYMS = {
//   "software engineer": ["software developer", "sde", "swe"],
//   "software developer": ["software engineer", "sde"],
//   "data scientist": ["data analyst", "ml engineer", "machine learning engineer"],
//   "product manager": ["product owner", "pm"],
//   "frontend developer": ["front end engineer", "ui developer", "react developer"],
//   "backend developer": ["back end engineer", "server side developer"],
//   "full stack developer": ["full stack engineer", "fullstack developer"],
//   "devops engineer": ["site reliability engineer", "sre", "cloud engineer"],
//   "hr manager": ["human resources manager", "hr business partner"],
//   "sales executive": ["sales representative", "business development executive"],
// };

// function getTitleSynonyms(title) {
//   const key = normalize(title);
//   return TITLE_SYNONYMS[key] || [];
// }

// // Broader region for a given city, used to widen location-based variants
// const LOCATION_BROADENING = {
//   bangalore: "karnataka india",
//   hyderabad: "telangana india",
//   mumbai: "maharashtra india",
//   pune: "maharashtra india",
//   chennai: "tamil nadu india",
//   delhi: "delhi ncr india",
//   gurugram: "haryana india",
// };

// // Skills are submitted as a comma-separated string, e.g. "React, Node.js, AWS"
// function parseSkills(skills = "") {
//   return skills
//     .split(",")
//     .map((s) => s.trim())
//     .filter(Boolean);
// }

// // ---------------------------------------------------------------------------
// // Query building
// // ---------------------------------------------------------------------------

// function buildQuery(criteria = {}) {
//   const {
//     name = "",
//     title = "",
//     company = "",
//     location = "",
//     industry = "",
//     skills = "",
//   } = criteria;

//   const parts = ["LinkedIn"];

//   if (name.trim()) parts.push(name.trim());
//   if (title.trim()) parts.push(title.trim());
//   if (company.trim()) parts.push(company.trim());
//   if (industry.trim()) parts.push(industry.trim());
//   if (skills.trim()) parts.push(skills.trim());
//   if (location.trim()) parts.push(normalizeLocation(location));

//   return parts.join(" ");
// }

// // Builds several distinct query variants for the same criteria, including
// // title synonyms and broadened location phrasing, so Serper surfaces a
// // wider, more diverse slice of indexed profiles.
// function buildQueryVariants(criteria = {}) {
//   const {
//     name = "",
//     title = "",
//     company = "",
//     location = "",
//     //industry = "",
//     skills = "",
//   } = criteria;

//   const cleanName = name.trim();
//   const cleanTitle = title.trim();
//   const cleanCompany = company.trim();
//   //const cleanIndustry = industry.trim();
//   const cleanLocation = location.trim() ? normalizeLocation(location) : "";
//   const broadLocation = cleanLocation ? LOCATION_BROADENING[cleanLocation] : "";
//   const skillsList = parseSkills(skills);

//   const variants = new Set();

//   // 1. Baseline
//   variants.add(buildQuery(criteria));

//   // 2. site: restricted, quoted title
//   {
//     const parts = ["site:linkedin.com/in"];
//     if (cleanName) parts.push(cleanName);
//     if (cleanTitle) parts.push(`"${cleanTitle}"`);
//     if (cleanCompany) parts.push(cleanCompany);
//     if (cleanIndustry) parts.push(cleanIndustry);
//     if (cleanLocation) parts.push(cleanLocation);
//     variants.add(parts.join(" "));
//   }

//   // 3. Location-led, quoted title, no "LinkedIn" prefix
//   if (cleanTitle) {
//     const parts = [];
//     if (cleanLocation) parts.push(cleanLocation);
//     parts.push(`"${cleanTitle}"`);
//     if (cleanCompany) parts.push(cleanCompany);
//     parts.push("linkedin profile");
//     variants.add(parts.join(" "));
//   }

//   // 4. Loose phrasing, no quotes
//   {
//     const parts = ["linkedin"];
//     if (cleanTitle) parts.push(cleanTitle);
//     if (cleanLocation) parts.push(cleanLocation);
//     if (cleanCompany) parts.push(cleanCompany);
//     if (cleanName) parts.push(cleanName);
//     variants.add(parts.join(" "));
//   }

//   // 5. Title synonym variants
//   getTitleSynonyms(cleanTitle).forEach((synonym) => {
//     const parts = ["site:linkedin.com/in", `"${synonym}"`];
//     if (cleanCompany) parts.push(cleanCompany);
//     if (cleanLocation) parts.push(cleanLocation);
//     variants.add(parts.join(" "));
//   });

//   // 6. Broadened location (state/region instead of city)
//   if (broadLocation && cleanTitle) {
//     variants.add(`site:linkedin.com/in "${cleanTitle}" ${broadLocation}`);
//   }

//   // 7. Company-led variant (useful when company is a strong signal)
//   if (cleanCompany) {
//     const parts = ["site:linkedin.com/in", cleanCompany];
//     if (cleanTitle) parts.push(cleanTitle);
//     if (cleanLocation) parts.push(cleanLocation);
//     variants.add(parts.join(" "));
//   }

//   // 8. Industry-led variant
// //   if (cleanIndustry) {
// //     const parts = ["site:linkedin.com/in", cleanIndustry];
// //     if (cleanTitle) parts.push(cleanTitle);
// //     if (cleanLocation) parts.push(cleanLocation);
// //     variants.add(parts.join(" "));
// //   }

//   // 9. Skills-led variant(s) — one variant per skill (capped at 3 to keep
//   // request volume reasonable), since combining all skills into one query
//   // tends to over-narrow results
//   skillsList.slice(0, 3).forEach((skill) => {
//     const parts = ["site:linkedin.com/in", `"${skill}"`];
//     if (cleanTitle) parts.push(cleanTitle);
//     if (cleanLocation) parts.push(cleanLocation);
//     variants.add(parts.join(" "));
//   });

//   return Array.from(variants).filter(Boolean);
// }

// // ---------------------------------------------------------------------------
// // Relevance scoring
// // ---------------------------------------------------------------------------

// function partialMatchRatio(text, query) {
//   const words = normalize(query).split(" ").filter(Boolean);
//   if (words.length === 0) return 0;

//   const matchedWords = words.filter((w) => text.includes(w));
//   return matchedWords.length / words.length;
// }

// function calculateScore(profile, criteria) {
//   let score = 0;
//   const text = normalize(`${profile.title} ${profile.snippet}`);

//   // Weights rebalanced now that industry + skills are part of the picture:
//   // name 30, title 25, company 15, industry 10, skills 15 (split across
//   // however many skills were given), location 5 (+ a small broadened bonus)

//   if (criteria.name) {
//     score += partialMatchRatio(text, criteria.name) * 30;
//   }

//   if (criteria.title) {
//     // Give credit if the exact title OR any known synonym matches
//     const directRatio = partialMatchRatio(text, criteria.title);
//     const synonymRatios = getTitleSynonyms(criteria.title).map((syn) =>
//       partialMatchRatio(text, syn)
//     );
//     const bestRatio = Math.max(directRatio, ...synonymRatios, 0);
//     score += bestRatio * 25;
//   }

//   if (criteria.company) {
//     score += partialMatchRatio(text, criteria.company) * 15;
//   }

//   if (criteria.industry) {
//     score += partialMatchRatio(text, criteria.industry) * 10;
//   }

//   if (criteria.skills) {
//     const skillsList = parseSkills(criteria.skills);
//     if (skillsList.length > 0) {
//       // Average match ratio across all requested skills, so profiles
//       // matching more of the requested skills score higher
//       const skillRatios = skillsList.map((skill) =>
//         partialMatchRatio(text, skill)
//       );
//       const avgSkillRatio =
//         skillRatios.reduce((sum, r) => sum + r, 0) / skillRatios.length;
//       score += avgSkillRatio * 15;
//     }
//   }

//   if (criteria.location) {
//     const location = normalizeLocation(criteria.location);
//     if (
//       location === "bangalore" &&
//       (text.includes("bangalore") || text.includes("bengaluru"))
//     ) {
//       score += 5;
//     } else if (text.includes(location)) {
//       score += 5;
//     } else {
//       // Partial credit if the broadened region (state/country) appears
//       const broad = LOCATION_BROADENING[location];
//       if (broad && broad.split(" ").some((w) => text.includes(w))) {
//         score += 3;
//       }
//     }
//   }

//   return Math.round(score);
// }

// // ---------------------------------------------------------------------------
// // Field extraction from snippet text
// // ---------------------------------------------------------------------------

// function extractField(snippet, label) {
//   const regex = new RegExp(`${label}:\\s*([^\\u00b7]+)`, "i");
//   const match = snippet.match(regex);
//   return match ? match[1].trim().replace(/\.$/, "") : "";
// }

// function extractLocationFallback(snippet) {
//   const match = snippet.match(
//     /([A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*,\s[A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*(?:,\s[A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*)?)/
//   );
//   return match ? match[1].trim() : "";
// }

// function enrichProfileFields(profile) {
//   const snippet = profile.snippet || "";

//   const company = extractField(snippet, "Experience") || "";
//   const education = extractField(snippet, "Education") || "";
//   const skillsRaw = extractField(snippet, "Skills") || "";
//   const structuredLocation = extractField(snippet, "Location");
//   const location = structuredLocation || extractLocationFallback(snippet);

//   return {
//     ...profile,
//     company: profile.company || company,
//     education: profile.education || education,
//     location: profile.location || location,
//     skills: profile.skills || skillsRaw,
//   };
// }

// // ---------------------------------------------------------------------------
// // Dedup
// // ---------------------------------------------------------------------------

// function removeDuplicates(profiles) {
//   const seen = new Set();
//   return profiles.filter((profile) => {
//     if (seen.has(profile.linkedinUrl)) return false;
//     seen.add(profile.linkedinUrl);
//     return true;
//   });
// }

// // ---------------------------------------------------------------------------
// // SerpApi fetch
// // ---------------------------------------------------------------------------

// // SerpApi uses 0-based "start" offsets (0, 10, 20...) rather than a plain
// // "page" number. We keep "page" (1, 2, 3...) at the call site for
// // readability and convert it internally.
// async function fetchSerpApiPage(query, apiKey, page) {
//   const start = (page - 1) * 10;

//   const response = await axios.get(SERPAPI_URL, {
//     params: {
//       engine: "google",
//       q: query,
//       num: 10,
//       start,
//       api_key: apiKey,
//       gl: "in",   // country = India, surfaces more India-indexed results
//       hl: "en",   // language = English
//     },
//   });

//   return response.data.organic_results || [];
// }

// // ---------------------------------------------------------------------------
// // Main search function
// // ---------------------------------------------------------------------------

// async function searchLinkedInProfiles(criteria = {}, options = {}) {
//   const apiKey = process.env.SERPAPI_API_KEY;

//   if (!apiKey) {
//     throw new Error("SERPAPI_API_KEY missing");
//   }

//   const queryVariants = buildQueryVariants(criteria);
//   const primaryQuery = queryVariants[0];

//   // Total SerpApi requests = variants * pagesPerVariant.
//   // Default: ~6-8 variants * 3 pages = 18-24 requests per search.
//   const PAGES_PER_VARIANT = options.pagesPerVariant || 3;

//   // How many criteria fields were actually provided
//   const criteriaFieldCount = [
//     "name",
//     "title",
//     "company",
//     "location",
//     //"industry",
//     "skills",
//   ].filter((f) => (criteria[f] || "").trim()).length;

//   // Accuracy floor: require at least a partial match on the given criteria
//   // rather than showing 0-relevance noise. Scales with how many fields
//   // were provided, so a single-field search isn't held to an unreasonably
//   // high bar.
//   const MIN_RELEVANCE =
//     options.minRelevance != null
//       ? options.minRelevance
//       : Math.max(5, criteriaFieldCount * 5);

//   // Cap on how many results to return, so the response stays a curated
//   // top-N rather than every single thing that scraped past the floor.
//   const MAX_RESULTS = options.maxResults || 60;

//   console.log("Query variants:", queryVariants);
//   console.log("Min relevance floor:", MIN_RELEVANCE);

//   try {
//     const requests = [];
//     let failedRequestCount = 0;

//     queryVariants.forEach((variantQuery) => {
//       for (let page = 1; page <= PAGES_PER_VARIANT; page++) {
//         requests.push(
//           fetchSerpApiPage(variantQuery, apiKey, page).catch((err) => {
//             failedRequestCount += 1;
//             console.error(
//               `SerpApi request failed for "${variantQuery}" page ${page}:`,
//               err.response?.data || err.message
//             );
//             return [];
//           })
//         );
//       }
//     });

//     const pageResults = await Promise.all(requests);
//     const results = pageResults.flat();

//     let profiles = results
//       .filter((item) => item.link && item.link.includes("linkedin.com/in"))
//       .map((item) => {
//         const profile = {
//           name: item.title || "",
//           title: item.title || "",
//           jobTitle: item.title || "",
//           company: "",
//           location: "",
//           education: "",
//           skills: "",
//          // industry: "",
//           linkedinUrl: item.link,
//           profileUrl: item.link,
//           snippet: item.snippet || "",
//           description: item.snippet || "",
//         };

//         const enriched = enrichProfileFields(profile);

//         return {
//           ...enriched,
//           relevance: calculateScore(enriched, criteria),
//         };
//       });

//     profiles = removeDuplicates(profiles);

//     const totalBeforeFilter = profiles.length;

//     // Accuracy filter: keep only profiles that meaningfully match at
//     // least some of what was searched for.
//     profiles = profiles.filter((profile) => profile.relevance >= MIN_RELEVANCE);

//     profiles.sort((a, b) => b.relevance - a.relevance);

//     const truncated = profiles.length > MAX_RESULTS;
//     profiles = profiles.slice(0, MAX_RESULTS);

//     console.log(
//       `SerpApi requests: ${requests.length} total, ${failedRequestCount} failed`
//     );

//     console.log(
//       `Raw LinkedIn links: ${totalBeforeFilter} -> after relevance floor: ${profiles.length}${
//         truncated ? ` (capped at ${MAX_RESULTS})` : ""
//       }`
//     );

//     return {
//       query: primaryQuery,
//       queryVariants,
//       totalResults: profiles.length,
//       profiles,
//     };
//   } catch (error) {
//     console.error("SerpApi Error:", error.response?.data || error.message);
//     throw new Error(
//       error.response?.data?.error || "Unable to search LinkedIn profiles"
//     );
//   }
// }

// module.exports = {
//   searchLinkedInProfiles,
//   buildQuery,
//   buildQueryVariants,
//   calculateScore,
// };

const axios = require("axios");

//const SERPAPI_URL = "https://serpapi.com/search.json";

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

function normalize(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

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
    ncr: "delhi",
    gurgaon: "gurugram",
    gurugram: "gurugram",
  };

  return map[value] || value;
}

// Common job title synonyms. Extend this map as you notice more patterns
// in your own data (e.g. add "data scientist" -> ["data analyst", ...]).
const TITLE_SYNONYMS = {
  "software engineer": ["software developer", "sde", "swe"],
  "software developer": ["software engineer", "sde"],
  "data scientist": ["data analyst", "ml engineer", "machine learning engineer"],
  "product manager": ["product owner", "pm"],
  "frontend developer": ["front end engineer", "ui developer", "react developer"],
  "backend developer": ["back end engineer", "server side developer"],
  "full stack developer": ["full stack engineer", "fullstack developer"],
  "devops engineer": ["site reliability engineer", "sre", "cloud engineer"],
  "hr manager": ["human resources manager", "hr business partner"],
  "sales executive": ["sales representative", "business development executive"],
};

function getTitleSynonyms(title) {
  const key = normalize(title);
  return TITLE_SYNONYMS[key] || [];
}

// Broader region for a given city, used to widen location-based variants
const LOCATION_BROADENING = {
  bangalore: "karnataka india",
  hyderabad: "telangana india",
  mumbai: "maharashtra india",
  pune: "maharashtra india",
  chennai: "tamil nadu india",
  delhi: "delhi ncr india",
  gurugram: "haryana india",
};

// Skills are submitted as a comma-separated string, e.g. "React, Node.js, AWS"
function parseSkills(skills = "") {
  return skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Query building
// ---------------------------------------------------------------------------

function buildQuery(criteria = {}) {
  const {
    name = "",
    title = "",
    company = "",
    location = "",
    skills = "",
  } = criteria;

  const parts = ["LinkedIn"];

  if (name.trim()) parts.push(name.trim());
  if (title.trim()) parts.push(title.trim());
  if (company.trim()) parts.push(company.trim());
  if (skills.trim()) parts.push(skills.trim());
  if (location.trim()) parts.push(normalizeLocation(location));

  return parts.join(" ");
}

// Builds several distinct query variants for the same criteria, including
// title synonyms and broadened location phrasing, so Serper surfaces a
// wider, more diverse slice of indexed profiles.
function buildQueryVariants(criteria = {}) {
  const {
    name = "",
    title = "",
    company = "",
    location = "",
    skills = "",
  } = criteria;

  const cleanName = name.trim();
  const cleanTitle = title.trim();
  const cleanCompany = company.trim();
  const cleanLocation = location.trim() ? normalizeLocation(location) : "";
  const broadLocation = cleanLocation ? LOCATION_BROADENING[cleanLocation] : "";
  const skillsList = parseSkills(skills);

  const variants = new Set();

  // 1. Baseline
  variants.add(buildQuery(criteria));

  // 2. site: restricted, quoted title
  {
    const parts = ["site:linkedin.com/in"];
    if (cleanName) parts.push(cleanName);
    if (cleanTitle) parts.push(`"${cleanTitle}"`);
    if (cleanCompany) parts.push(cleanCompany);
    if (cleanLocation) parts.push(cleanLocation);
    variants.add(parts.join(" "));
  }

  // 3. Location-led, quoted title, no "LinkedIn" prefix
  if (cleanTitle) {
    const parts = [];
    if (cleanLocation) parts.push(cleanLocation);
    parts.push(`"${cleanTitle}"`);
    if (cleanCompany) parts.push(cleanCompany);
    parts.push("linkedin profile");
    variants.add(parts.join(" "));
  }

  // 4. Loose phrasing, no quotes
  {
    const parts = ["linkedin"];
    if (cleanTitle) parts.push(cleanTitle);
    if (cleanLocation) parts.push(cleanLocation);
    if (cleanCompany) parts.push(cleanCompany);
    if (cleanName) parts.push(cleanName);
    variants.add(parts.join(" "));
  }

  // 5. Title synonym variants
  getTitleSynonyms(cleanTitle).forEach((synonym) => {
    const parts = ["site:linkedin.com/in", `"${synonym}"`];
    if (cleanCompany) parts.push(cleanCompany);
    if (cleanLocation) parts.push(cleanLocation);
    variants.add(parts.join(" "));
  });

  // 6. Broadened location (state/region instead of city)
  if (broadLocation && cleanTitle) {
    variants.add(`site:linkedin.com/in "${cleanTitle}" ${broadLocation}`);
  }

  // 7. Company-led variant (useful when company is a strong signal)
  if (cleanCompany) {
    const parts = ["site:linkedin.com/in", cleanCompany];
    if (cleanTitle) parts.push(cleanTitle);
    if (cleanLocation) parts.push(cleanLocation);
    variants.add(parts.join(" "));
  }

  // 8. Skills-led variant(s) — one variant per skill (capped at 3 to keep
  // request volume reasonable), since combining all skills into one query
  // tends to over-narrow results
  skillsList.slice(0, 3).forEach((skill) => {
    const parts = ["site:linkedin.com/in", `"${skill}"`];
    if (cleanTitle) parts.push(cleanTitle);
    if (cleanLocation) parts.push(cleanLocation);
    variants.add(parts.join(" "));
  });

  return Array.from(variants).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Relevance scoring
// ---------------------------------------------------------------------------

function partialMatchRatio(text, query) {
  const words = normalize(query).split(" ").filter(Boolean);
  if (words.length === 0) return 0;

  const matchedWords = words.filter((w) => text.includes(w));
  return matchedWords.length / words.length;
}

function calculateScore(profile, criteria) {
  let score = 0;
  const text = normalize(`${profile.title} ${profile.snippet}`);

  // Weights: name 30, title 25, company 20, skills 20 (split across
  // however many skills were given), location 5 (+ a small broadened bonus)

  if (criteria.name) {
    score += partialMatchRatio(text, criteria.name) * 30;
  }

  if (criteria.title) {
    // Give credit if the exact title OR any known synonym matches
    const directRatio = partialMatchRatio(text, criteria.title);
    const synonymRatios = getTitleSynonyms(criteria.title).map((syn) =>
      partialMatchRatio(text, syn)
    );
    const bestRatio = Math.max(directRatio, ...synonymRatios, 0);
    score += bestRatio * 25;
  }

  if (criteria.company) {
    score += partialMatchRatio(text, criteria.company) * 20;
  }

  if (criteria.skills) {
    const skillsList = parseSkills(criteria.skills);
    if (skillsList.length > 0) {
      // Average match ratio across all requested skills, so profiles
      // matching more of the requested skills score higher
      const skillRatios = skillsList.map((skill) =>
        partialMatchRatio(text, skill)
      );
      const avgSkillRatio =
        skillRatios.reduce((sum, r) => sum + r, 0) / skillRatios.length;
      score += avgSkillRatio * 20;
    }
  }

  if (criteria.location) {
    const location = normalizeLocation(criteria.location);
    if (
      location === "bangalore" &&
      (text.includes("bangalore") || text.includes("bengaluru"))
    ) {
      score += 5;
    } else if (text.includes(location)) {
      score += 5;
    } else {
      // Partial credit if the broadened region (state/country) appears
      const broad = LOCATION_BROADENING[location];
      if (broad && broad.split(" ").some((w) => text.includes(w))) {
        score += 3;
      }
    }
  }

  return Math.round(score);
}

// ---------------------------------------------------------------------------
// Field extraction from snippet text
// ---------------------------------------------------------------------------

function extractField(snippet, label) {
  const regex = new RegExp(`${label}:\\s*([^\\u00b7]+)`, "i");
  const match = snippet.match(regex);
  return match ? match[1].trim().replace(/\.$/, "") : "";
}

function extractLocationFallback(snippet) {
  const match = snippet.match(
    /([A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*,\s[A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*(?:,\s[A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*)?)/
  );
  return match ? match[1].trim() : "";
}

function enrichProfileFields(profile) {
  const snippet = profile.snippet || "";

  const company = extractField(snippet, "Experience") || "";
  const education = extractField(snippet, "Education") || "";
  const skillsRaw = extractField(snippet, "Skills") || "";
  const structuredLocation = extractField(snippet, "Location");
  const location = structuredLocation || extractLocationFallback(snippet);

  return {
    ...profile,
    company: profile.company || company,
    education: profile.education || education,
    location: profile.location || location,
    skills: profile.skills || skillsRaw,
  };
}

// ---------------------------------------------------------------------------
// Dedup
// ---------------------------------------------------------------------------

function removeDuplicates(profiles) {
  const seen = new Set();
  return profiles.filter((profile) => {
    if (seen.has(profile.linkedinUrl)) return false;
    seen.add(profile.linkedinUrl);
    return true;
  });
}

// ---------------------------------------------------------------------------
// SerpApi fetch
// ---------------------------------------------------------------------------

// SerpApi uses 0-based "start" offsets (0, 10, 20...) rather than a plain
// "page" number. We keep "page" (1, 2, 3...) at the call site for
// readability and convert it internally.
async function fetchSerpApiPage(query, apiKey, page) {
  const start = (page - 1) * 10;

  const response = await axios.get(SERPAPI_URL, {
    params: {
      engine: "google",
      q: query,
      num: 10,
      start,
      api_key: apiKey,
      gl: "in",   // country = India, surfaces more India-indexed results
      hl: "en",   // language = English
    },
  });

  return response.data.organic_results || [];
}

// ---------------------------------------------------------------------------
// Main search function
// ---------------------------------------------------------------------------

async function searchLinkedInProfiles(criteria = {}, options = {}) {
  const apiKey = process.env.SERPAPI_API_KEY;

  console.log("SERPAPI_API_KEY present:", !!apiKey, "length:", apiKey ? apiKey.length : 0);

  if (!apiKey) {
    throw new Error("SERPAPI_API_KEY missing");
  }

  const queryVariants = buildQueryVariants(criteria);
  const primaryQuery = queryVariants[0];

  // Total SerpApi requests = variants * pagesPerVariant.
  // Default: ~6-8 variants * 3 pages = 18-24 requests per search.
  const PAGES_PER_VARIANT = options.pagesPerVariant || 3;

  // How many criteria fields were actually provided
  const criteriaFieldCount = [
    "name",
    "title",
    "company",
    "location",
    "skills",
  ].filter((f) => (criteria[f] || "").trim()).length;

  // Accuracy floor: require at least a partial match on the given criteria
  // rather than showing 0-relevance noise. Scales with how many fields
  // were provided, so a single-field search isn't held to an unreasonably
  // high bar.
  const MIN_RELEVANCE =
    options.minRelevance != null
      ? options.minRelevance
      : Math.max(5, criteriaFieldCount * 5);

  // Cap on how many results to return, so the response stays a curated
  // top-N rather than every single thing that scraped past the floor.
  const MAX_RESULTS = options.maxResults || 60;

  console.log("Query variants:", queryVariants);
  console.log("Min relevance floor:", MIN_RELEVANCE);

  try {
    const requests = [];
    let failedRequestCount = 0;

    queryVariants.forEach((variantQuery) => {
      for (let page = 1; page <= PAGES_PER_VARIANT; page++) {
        requests.push(
          fetchSerpApiPage(variantQuery, apiKey, page).catch((err) => {
            failedRequestCount += 1;
            console.error(
              `SerpApi request failed for "${variantQuery}" page ${page}:`,
              err.response?.data || err.message
            );
            return [];
          })
        );
      }
    });

    const pageResults = await Promise.all(requests);
    const results = pageResults.flat();

    let profiles = results
      .filter((item) => item.link && item.link.includes("linkedin.com/in"))
      .map((item) => {
        const profile = {
          name: item.title || "",
          title: item.title || "",
          jobTitle: item.title || "",
          company: "",
          location: "",
          education: "",
          skills: "",
          linkedinUrl: item.link,
          profileUrl: item.link,
          snippet: item.snippet || "",
          description: item.snippet || "",
        };

        const enriched = enrichProfileFields(profile);

        return {
          ...enriched,
          relevance: calculateScore(enriched, criteria),
        };
      });

    profiles = removeDuplicates(profiles);

    const totalBeforeFilter = profiles.length;

    // Accuracy filter: keep only profiles that meaningfully match at
    // least some of what was searched for.
    profiles = profiles.filter((profile) => profile.relevance >= MIN_RELEVANCE);

    profiles.sort((a, b) => b.relevance - a.relevance);

    const truncated = profiles.length > MAX_RESULTS;
    profiles = profiles.slice(0, MAX_RESULTS);

    console.log(
      `SerpApi requests: ${requests.length} total, ${failedRequestCount} failed`
    );

    console.log(
      `Raw LinkedIn links: ${totalBeforeFilter} -> after relevance floor: ${profiles.length}${
        truncated ? ` (capped at ${MAX_RESULTS})` : ""
      }`
    );

    return {
      query: primaryQuery,
      queryVariants,
      totalResults: profiles.length,
      profiles,
    };
  } catch (error) {
    console.error("SerpApi Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error || "Unable to search LinkedIn profiles"
    );
  }
}

module.exports = {
  searchLinkedInProfiles,
  buildQuery,
  buildQueryVariants,
  calculateScore,
};
