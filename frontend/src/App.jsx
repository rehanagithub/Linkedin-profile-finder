import { useState } from "react";
import SearchForm from "./components/SearchForm.jsx";
import ResultsGrid, { LoadingSkeleton, EmptyState, ErrorState } from "./components/ResultsGrid.jsx";
import { searchProfiles } from "./api.js";
//import "./styles/App.css";

export default function App() {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastCriteria, setLastCriteria] = useState(null);

  async function runSearch(criteria) {
    setStatus("loading");
    setLastCriteria(criteria);
    try {
      const data = await searchProfiles(criteria);
      setResults(data.results || []);
      setMeta(data);
      setStatus("done");
    } catch (err) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <div className="eyebrow">Public profile discovery</div>
          <h1>
            Find the <em>person</em> behind the name.
          </h1>
          <p className="lede">
            Enter what you know — a name, a title, a company — and pull together public
            LinkedIn profiles that match, drawn straight from what's already indexed and
            open to the public.
          </p>
          <p className="compliance-note">
            Results come from public search-engine indexing of publicly visible LinkedIn
            pages — no login walls, CAPTCHAs, or access controls are bypassed, and
            LinkedIn's own servers are never crawled directly.
          </p>
        </div>
      </header>

      <div className="search-panel">
        <SearchForm onSearch={runSearch} loading={status === "loading"} />
      </div>

      <section className="results-section">
        {status === "loading" && <LoadingSkeleton />}

        {status === "idle" && <EmptyState searched={false} />}

        {status === "error" && (
          <ErrorState message={errorMessage} onRetry={() => lastCriteria && runSearch(lastCriteria)} />
        )}

        {status === "done" && results.length === 0 && <EmptyState searched={true} />}

        {status === "done" && results.length > 0 && (
          <>
            <div className="results-meta">
              <span>
                <strong>{results.length}</strong> profile{results.length === 1 ? "" : "s"} found
              </span>
              {meta?.cached && <span>served from cache</span>}
            </div>
            <ResultsGrid results={results} />
          </>
        )}
      </section>

      <footer className="footer">
        Built for compliant public-profile discovery · results are only as accurate as what
        search engines have publicly indexed
      </footer>
    </div>
  );
}
