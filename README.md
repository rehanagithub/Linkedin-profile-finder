# Dossier — Public LinkedIn Profile Finder

A search tool that helps you locate **public** LinkedIn profiles matching a
name, job title, company, location, industry, or keywords — built with a
React frontend, a Node.js/Express backend, and Supabase for caching and
search history.

## How profile discovery actually works (read this first)

LinkedIn's Terms of Service prohibit scraping the site, automating logins,
or bypassing CAPTCHAs/rate limits — and this assignment explicitly asks for
compliant methods. So instead of touching linkedin.com directly, this app:

1. Sends your search criteria to **Google Programmable Search Engine**,
   restricted with `site:linkedin.com/in`.
2. Google (which has already legally crawled LinkedIn's public, indexable
   pages, same as anyone using google.com) returns whichever public profile
   pages match.
3. The backend parses the title/snippet metadata Google already indexed
   (name, headline, company) into structured fields, scores each result's
   relevance against your inputs, and returns them.

**What this means for accuracy:** results are limited to profiles LinkedIn
has allowed to be publicly indexed (most public profiles are, but privacy
settings, regional rules, or de-indexing can exclude some). This is a hard
ceiling on any tool built without violating LinkedIn's access controls — no
compliant tool can guarantee 100% coverage or perfectly structured data,
because it depends on someone else's index, not a live database of LinkedIn
itself.

## Architecture

```
frontend/   React + Vite SPA — search form, result cards, loading/empty/error states
backend/    Node.js + Express API — builds the search query, calls Google CSE,
            parses + scores results, caches via Supabase
supabase/   SQL schema for result caching + search history
```

```
User → React form → POST /api/search → Express
                                          ├─ check Supabase cache (search_cache)
                                          ├─ if miss: query Google CSE (site:linkedin.com/in)
                                          ├─ parse + score results
                                          ├─ write cache + search_history
                                          └─ return ranked JSON
```

## Prerequisites

- Node.js 18+
- A [Google Cloud](https://console.cloud.google.com/) project with the
  **Custom Search API** enabled, and an API key
- A [Programmable Search Engine](https://programmablesearchengine.google.com/)
  configured to search the entire web (get its Search Engine ID / `cx`)
- A free [Supabase](https://supabase.com) project

## 1. Supabase setup

1. Create a project at supabase.com.
2. Open **SQL Editor** and run `supabase/schema.sql` from this repo.
3. Copy your **Project URL** and **service_role key** (Settings → API) —
   you'll need both for the backend `.env`.

## 2. Backend setup

```bash
cd backend
cp .env.example .env
# fill in GOOGLE_API_KEY, GOOGLE_CSE_ID, SUPABASE_URL, SUPABASE_SERVICE_KEY
npm install
npm run dev
```

The API starts on `http://localhost:8080`. Check `GET /api/health`.

## 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# set VITE_API_BASE to your backend URL (http://localhost:8080 for local dev)
npm install
npm run dev
```

Open `http://localhost:5173`.

## Deployment (free-tier friendly)

**Backend → Render / Railway / Fly.io**
- New Web Service → point at `backend/`
- Build command: `npm install`
- Start command: `npm start`
- Add the same environment variables from `backend/.env`

**Frontend → Vercel / Netlify**
- New Project → point at `frontend/`
- Build command: `npm run build`, output directory: `dist`
- Environment variable: `VITE_API_BASE=<your deployed backend URL>`

**Database → Supabase** (already hosted, nothing else to deploy)

Once both are deployed, update `CORS_ORIGIN` in the backend env to your
frontend's live URL, and `VITE_API_BASE` in the frontend to your backend's
live URL, then redeploy both.

> I can't create Google Cloud, Supabase, or hosting accounts on your
> behalf — those require your own credentials and billing/quota
> ownership. Everything above is scripted so it's a ~15–20 minute setup
> once you have those three accounts open.

## API reference

`POST /api/search`

```json
{
  "name": "Ananya Rao",
  "title": "Product Manager",
  "company": "Razorpay",
  "location": "Bengaluru",
  "industry": "Fintech",
  "keywords": "SQL, growth, analytics"
}
```

Response:

```json
{
  "results": [
    {
      "name": "Ananya Rao",
      "jobTitle": "Senior Product Manager",
      "company": "Razorpay",
      "location": "Bengaluru, Karnataka, India",
      "profileUrl": "https://www.linkedin.com/in/...",
      "snippet": "...",
      "relevance": 0.87
    }
  ],
  "cached": false,
  "count": 1,
  "totalIndexed": 42
}
```

Error responses use `{ "error": "<CODE>", "message": "<human readable>" }`
with codes `EMPTY_QUERY` (400), `NOT_CONFIGURED` (503), `RATE_LIMITED`
(429), `SEARCH_FAILED` (502).

## Known limitations

- Coverage depends entirely on what Google has publicly indexed — not
  every LinkedIn profile is indexable, and LinkedIn can change this at any
  time.
- Parsing name/title/company from search-result metadata is heuristic;
  unusual title formats may parse imperfectly.
- Google Custom Search's free tier is capped at 100 queries/day — the
  Supabase cache exists specifically to stretch that quota.
