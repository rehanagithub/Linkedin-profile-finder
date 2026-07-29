// import dotenv from "dotenv";

// dotenv.config();

// export const ENV = {
//   PORT: process.env.PORT || 8080,

//   GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,

//   GOOGLE_CSE_ID: process.env.GOOGLE_CSE_ID,

//   SERPER_API_KEY: process.env.SERPER_API_KEY,

//   CORS_ORIGIN: process.env.CORS_ORIGIN
// };

// console.log({
//  GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
//  GOOGLE_CSE_ID: !!process.env.GOOGLE_CSE_ID,
//  SERPER_API_KEY: !!process.env.SERPER_API_KEY
// });


require("dotenv").config();


const ENV = {

  PORT: process.env.PORT || 8080,

  SERPER_API_KEY:
    process.env.SERPER_API_KEY,


  GOOGLE_API_KEY:
    process.env.GOOGLE_API_KEY,


  GOOGLE_CSE_ID:
    process.env.GOOGLE_CSE_ID

};


module.exports = {
  ENV
};