import { useEffect, useState } from "react";
import ProfileCard from "./ProfileCard.jsx";

export function LoadingSkeleton() {
  return (
    <div className="skeleton-grid" aria-label="Loading results">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="skeleton-card" key={i} />
      ))}
    </div>
  );
}

export function EmptyState({ searched }) {
  if (!searched) {
    return (
      <div className="state-block">
        <h3>The file is open, waiting.</h3>
        <p>
          Fill in a few details above and run a search to start pulling public
          profile matches.
        </p>
      </div>
    );
  }

  return (
    <div className="state-block">
      <h3>No matches found.</h3>
      <p>
        Nothing public was indexed for this search. Try removing some filters or
        searching with different keywords.
      </p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-block error">
      <h3>The search hit a snag.</h3>

      <p>{message || "Something went wrong."}</p>

      {onRetry && (
        <button
          className="btn-search"
          style={{ marginTop: "16px" }}
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default function ResultsGrid({ results = [] }) {
  const INITIAL_COUNT = 4;

  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  // Reset whenever new search results arrive
  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [results]);

  if (!results.length) {
    return <EmptyState searched={true} />;
  }

  const visibleProfiles = results.slice(0, visibleCount);

  return (
    <>
      <div
        style={{
          marginBottom: "20px",
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        Showing {visibleProfiles.length} of {results.length} Profiles
      </div>

      <div className="card-grid">
        {visibleProfiles.map((profile, index) => (
          <ProfileCard
            key={profile.profileUrl || profile.linkedinUrl || index}
            profile={{
              ...profile,
              profileUrl: profile.profileUrl || profile.linkedinUrl,
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginTop: "30px",
        }}
      >
        {visibleCount < results.length && (
          <button
            className="btn-search"
            onClick={() =>
              setVisibleCount((prev) =>
                Math.min(prev + INITIAL_COUNT, results.length)
              )
            }
          >
            View More
          </button>
        )}

        {visibleCount > INITIAL_COUNT && (
          <button
            className="btn-search"
            onClick={() => setVisibleCount(INITIAL_COUNT)}
          >
            Show Less
          </button>
        )}
      </div>
    </>
  );
}