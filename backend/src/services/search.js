// const express = require("express");
// const crypto = require("crypto");
// const { searchLinkedInProfiles } = require("../services/serperSearch");
// const { parseSearchItem } = require("../services/profileParser");
// const { scoreProfile } = require("../services/relevance");
// const { supabase } = require("../lib/supabaseClient");

// const router = express.Router();

// const FIELDS = ["name", "title", "company", "location", "industry", "keywords"];

// function cleanCriteria(body) {
//   const criteria = {};
//   FIELDS.forEach((f) => {
//     const v = (body[f] || "").toString().trim().slice(0, 120);
//     if (v) criteria[f] = v;
//   });
//   return criteria;
// }

// function cacheKeyFor(criteria) {
//   const normalized = FIELDS.map((f) => (criteria[f] || "").toLowerCase().trim()).join("|");
//   return crypto.createHash("sha256").update(normalized).digest("hex");
// }

// async function getCached(cacheKey) {
//   if (!supabase) return null;
//   const ttlHours = Number(process.env.CACHE_TTL_HOURS || 24);
//   const { data, error } = await supabase
//     .from("search_cache")
//     .select("results, created_at")
//     .eq("cache_key", cacheKey)
//     .single();

//   if (error || !data) return null;

//   const ageHours = (Date.now() - new Date(data.created_at).getTime()) / 36e5;
//   if (ageHours > ttlHours) return null;

//   return data.results;
// }

// async function saveCache(cacheKey, criteria, results) {
//   if (!supabase) return;
//   await supabase.from("search_cache").upsert({
//     cache_key: cacheKey,
//     criteria,
//     results,
//     created_at: new Date().toISOString(),
//   });
// }

// async function logHistory(criteria, resultCount, source) {
//   if (!supabase) return;
//   await supabase.from("search_history").insert({
//     criteria,
//     result_count: resultCount,
//     source, // "cache" | "google"
//     created_at: new Date().toISOString(),
//   });
// }

// router.post("/", async (req, res) => {
//   const criteria = cleanCriteria(req.body || {});

//   if (Object.keys(criteria).length === 0) {
//     return res.status(400).json({
//       error: "EMPTY_QUERY",
//       message: "Enter at least one search field (name, title, company, location, industry, or keywords).",
//     });
//   }

//   const cacheKey = cacheKeyFor(criteria);

//   try {
//     const cached = await getCached(cacheKey);
//     if (cached) {
//       await logHistory(criteria, cached.length, "cache");
//       return res.json({ results: cached, cached: true, count: cached.length });
//     }

//     const { query, items, totalResults } = await searchLinkedInProfiles(criteria, { num: 10 });

//     const results = items
//       .map(parseSearchItem)
//       .map((profile) => ({ ...profile, relevance: scoreProfile(profile, criteria) }))
//       .filter((p) => p.profileUrl && p.profileUrl.includes("linkedin.com/in"))
//       .sort((a, b) => b.relevance - a.relevance);

//     await saveCache(cacheKey, criteria, results);
//     await logHistory(criteria, results.length, "google");

//     return res.json({
//       results,
//       cached: false,
//       count: results.length,
//       totalIndexed: totalResults,
//       queryUsed: query,
//     });
//   } catch (err) {
//     if (err.code === "NOT_CONFIGURED") {
//       return res.status(503).json({
//         error: "NOT_CONFIGURED",
//         message: "Search backend isn't configured yet. Add SERPER_API_KEY to the server environment.",
//       });
//     }
//     if (err.status === 401) {
//       return res.status(502).json({
//         error: "INVALID_API_KEY",
//         message: "The search provider rejected the API key. Double-check SERPER_API_KEY in the server environment.",
//       });
//     }
//     if (err.status === 403) {
//       return res.status(429).json({
//         error: "OUT_OF_CREDITS",
//         message: "The search provider account is out of credits for now. Add more credits or wait for your plan to reset.",
//       });
//     }
//     if (err.status === 429) {
//       return res.status(429).json({
//         error: "RATE_LIMITED",
//         message: "Search quota exceeded for now. Please try again shortly.",
//       });
//     }
//     console.error("[search] error:", err);
//     return res.status(502).json({
//       error: "SEARCH_FAILED",
//       message: "We couldn't complete the search right now. Please try again.",
//     });
//   }
// });

// module.exports = router;

// router.post("/", async(req,res)=>{

//  console.log("Received Search Data:", req.body);

//  try {
//     const result =
//       await searchLinkedInProfiles(req.body);

//     res.json({
//       success:true,
//       data:result
//     });

//  } catch(error){
//     console.log(error);
//     res.status(500).json({
//       success:false,
//       message:error.message
//     });
//  }

// });
const express = require("express");

const {
 searchLinkedInProfiles
}=require("../services/serperSearch");


const router = express.Router();


router.post("/", async(req,res)=>{

    try{

        const result =
        await searchLinkedInProfiles(req.body);


        res.json(result);

    }

    catch(error){

        console.error(
            error.message
        );


        res.status(500).json({

            message:error.message

        });

    }

});


module.exports=router;