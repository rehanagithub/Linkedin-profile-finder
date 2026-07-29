// // // //import axios from "axios";
// // // //import { ENV } from "../config/env.js";

// // // const axios = require("axios");

// // // const { ENV } = require("../config/env");

// // // export async function searchLinkedInProfiles(criteria) {

// // //   if (!ENV.GOOGLE_API_KEY || !ENV.GOOGLE_CSE_ID) {
// // //     throw new Error(
// // //       "Search backend isn't configured yet. Add GOOGLE_API_KEY and GOOGLE_CSE_ID to the server environment."
// // //     );
// // //   }


// // //   const query = `site:linkedin.com/in ${criteria}`;


// // //   const response = await axios.get(
// // //     "https://www.googleapis.com/customsearch/v1",
// // //     {
// // //       params:{
// // //         key: ENV.GOOGLE_API_KEY,
// // //         cx: ENV.GOOGLE_CSE_ID,
// // //         q: query
// // //       }
// // //     }
// // //   );


// // //   return {
// // //     items: response.data.items || []
// // //   };
// // // }

// // const axios = require("axios");

// // const SERPER_ENDPOINT = "https://google.serper.dev/search";


// // /**
// //  * Build LinkedIn profile search query
// //  */
// // function buildQuery({
// //   name,
// //   title,
// //   company,
// //   location,
// //   industry,
// //   keywords
// // }) {

// //   const parts = ["site:linkedin.com/in"];


// //   const quoted = (value) => {
// //     return value && value.trim()
// //       ? `"${value.trim()}"`
// //       : null;
// //   };


// //   [
// //     name,
// //     title,
// //     company,
// //     location,
// //     industry
// //   ].forEach((value) => {

// //     const q = quoted(value);

// //     if (q) {
// //       parts.push(q);
// //     }

// //   });


// //   if (keywords && keywords.trim()) {

// //     const keywordList = keywords
// //       .split(",")
// //       .map((k) => k.trim())
// //       .filter(Boolean)
// //       .join(" OR ");


// //     if (keywordList) {
// //       parts.push(`(${keywordList})`);
// //     }
// //   }


// //   return parts.join(" ");
// // }



// // /**
// //  * Search LinkedIn profiles using Serper API
// //  */
// // async function searchLinkedInProfiles(
// //   criteria,
// //   { num = 10 } = {}
// // ) {

// //   const apiKey = process.env.SERPER_API_KEY;


// //   if (!apiKey) {

// //     const error = new Error(
// //       "SERPER_API_KEY is missing in backend .env"
// //     );

// //     error.code = "NOT_CONFIGURED";

// //     throw error;
// //   }


// //   const query = buildQuery(criteria);



// //   try {

// //     const response = await axios.post(
// //       SERPER_ENDPOINT,

// //       {
// //         q: query,
// //         num: Math.min(num, 10)
// //       },

// //       {
// //         headers: {

// //           "X-API-KEY": apiKey,

// //           "Content-Type": "application/json"

// //         },

// //         timeout: 15000
// //       }
// //     );



// //     const organicResults =
// //       response.data.organic || [];



// //     const items = organicResults.map((item) => ({

// //       title: item.title,

// //       link: item.link,

// //       snippet: item.snippet || ""

// //     }));



// //     return {

// //       query,

// //       items,

// //       totalResults: items.length

// //     };


// //   } catch (error) {


// //     if (error.response) {

// //       throw new Error(
// //         `Serper API failed: ${
// //           error.response.data?.message ||
// //           error.response.status
// //         }`
// //       );

// //     }


// //     throw error;

// //   }

// // }



// // module.exports = {
// //   searchLinkedInProfiles,
// //   buildQuery
// // };


// // const axios = require("axios");

// // const SERPER_ENDPOINT = "https://google.serper.dev/search";


// // function buildQuery({
// //   name,
// //   title,
// //   company,
// //   location,
// //   industry,
// //   keywords
// // }) {

// //   const parts = ["site:linkedin.com/in"];


// //   const addValue = (value) => {
// //     if (value && value.trim()) {
// //       parts.push(`"${value.trim()}"`);
// //     }
// //   };


// //   addValue(name);
// //   addValue(title);
// //   addValue(company);
// //   addValue(location);
// //   addValue(industry);


// //   if (keywords && keywords.trim()) {

// //     const keywordQuery = keywords
// //       .split(",")
// //       .map(item => item.trim())
// //       .filter(Boolean)
// //       .join(" OR ");

// //     if (keywordQuery) {
// //       parts.push(`(${keywordQuery})`);
// //     }
// //   }


// //   return parts.join(" ");
// // }



// // async function searchLinkedInProfiles(criteria, options = {}) {

// //   const num = options.num || 10;


// //   const apiKey = process.env.SERPER_API_KEY;


// //   if (!apiKey) {

// //     throw new Error(
// //       "SERPER_API_KEY missing in backend .env"
// //     );

// //   }


// //   const query = buildQuery(criteria);


// //   const response = await axios.post(

// //     SERPER_ENDPOINT,

// //     {
// //       q: query,
// //       num: Math.min(num,10)
// //     },

// //     {
// //       headers:{
// //         "X-API-KEY": apiKey,
// //         "Content-Type":"application/json"
// //       }
// //     }

// //   );


// //   const results = response.data.organic || [];


// //   const profiles = results.map(profile => ({

// //     name: profile.title,

// //     linkedinUrl: profile.link,

// //     description: profile.snippet || ""

// //   }));


// //   return {

// //     query,

// //     totalResults: profiles.length,

// //     profiles

// //   };

// // }



// // module.exports = {
// //   searchLinkedInProfiles,
// //   buildQuery
// // };


// function buildQuery(criteria) {

//   const {
//     name,
//     title,
//     company,
//     industry,
//     location,
//     keywords,
//     skills,
//     skillset
//   } = criteria;


//   const parts = [
//     "site:linkedin.com/in"
//   ];


//   const add = (value) => {
//     if (value && value.trim()) {
//       parts.push(`"${value.trim()}"`);
//     }
//   };


//   add(name);
//   add(title);
//   add(company);
//   add(industry);
//   add(location);


//   const allSkills =
//     skills ||
//     skillset ||
//     keywords;


//   if (allSkills) {

//     const skillArray = allSkills
//       .split(",")
//       .map(skill => skill.trim())
//       .filter(Boolean);


//     if (skillArray.length > 0) {

//       parts.push(
//         `(${skillArray
//           .map(skill => `"${skill}"`)
//           .join(" OR ")})`
//       );

//     }
//   }


//   // return parts.join(" ");

//   const finalQuery = parts.join(" ");

// console.log("Generated Query:", finalQuery);

// return finalQuery;
// }

const axios = require("axios");

const SERPER_ENDPOINT = "https://google.serper.dev/search";


// Create search query
function buildQuery(criteria = {}) {

  const {
    name,
    title,
    company,
    industry,
    location,
    keywords,
    skills,
    skillset
  } = criteria;


  const parts = [
    "site:linkedin.com/in"
  ];


  const addValue = (value) => {

    if (value && value.trim()) {
      parts.push(`"${value.trim()}"`);
    }

  };


  // Basic profile filters
  addValue(name);
  addValue(title);
  addValue(company);
  addValue(industry);
  addValue(location);



  // Skills search
  // Supports: skills, skillset, keywords

  const skillInput =
    skills ||
    skillset ||
    keywords;



  if (skillInput && skillInput.trim()) {


    const skillList = skillInput
      .split(",")
      .map(skill => skill.trim())
      .filter(Boolean);



    if (skillList.length > 0) {

      parts.push(
        `(${skillList
          .map(skill => `"${skill}"`)
          .join(" OR ")})`
      );

    }

  }



  const query = parts.join(" ");


  console.log("Generated Query:", query);


  return query;

}





// Search LinkedIn profiles using Serper API

async function searchLinkedInProfiles(criteria, options = {}) {


  const apiKey = process.env.SERPER_API_KEY;



  if (!apiKey) {

    throw new Error(
      "SERPER_API_KEY missing in backend .env"
    );

  }



  const query = buildQuery(criteria);



  console.log(
    "Searching Serper with:",
    query
  );



  try {


    const response = await axios.post(

      SERPER_ENDPOINT,

      {
        q: query,
        num: options.num || 10
      },


      {

        headers: {

          "X-API-KEY": apiKey,

          "Content-Type": "application/json"

        },

        timeout: 15000

      }

    );



    console.log(
      "Serper Results Count:",
      response.data.organic?.length || 0
    );



    const organicResults =
      response.data.organic || [];



    const profiles = organicResults.map(item => ({

      name: item.title,

      linkedinUrl: item.link,

      description: item.snippet || ""

    }));



    return {

      query,

      totalResults: profiles.length,

      profiles

    };



  } catch (error) {


    console.error(
      "Serper Error:",
      error.response?.data || error.message
    );


    throw new Error(
      error.response?.data?.message ||
      "Failed to search LinkedIn profiles"
    );

  }

}




module.exports = {
  searchLinkedInProfiles,
  buildQuery
};