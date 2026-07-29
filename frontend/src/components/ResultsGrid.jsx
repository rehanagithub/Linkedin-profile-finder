// import ProfileCard from "./ProfileCard.jsx";

// export function LoadingSkeleton() {
//   return (
//     <div className="skeleton-grid" aria-label="Loading results">
//       {Array.from({ length: 4 }).map((_, i) => (
//         <div className="skeleton-card" key={i} />
//       ))}
//     </div>
//   );
// }

// export function EmptyState({ searched }) {
//   if (!searched) {
//     return (
//       <div className="state-block">
//         <h3>The file is open, waiting.</h3>
//         <p>Fill in a few details above and run a search to start pulling public profile matches.</p>
//       </div>
//     );
//   }
//   return (
//     <div className="state-block">
//       <h3>No matches on record.</h3>
//       <p>
//         Nothing public was indexed for this combination. Try loosening a field — drop the
//         location or shorten the job title — and search again.
//       </p>
//     </div>
//   );
// }

// export function ErrorState({ message, onRetry }) {
//   return (
//     <div className="state-block error">
//       <h3>The search hit a snag.</h3>
//       <p>{message || "Something went wrong on our end."}</p>
//       {onRetry && (
//         <button className="btn-search" style={{ marginTop: 16 }} onClick={onRetry}>
//           Try again
//         </button>
//       )}
//     </div>
//   );
// }

// export default function ResultsGrid({ results }) {
//   return (
//     <div className="card-grid">
//       {results.map((p) => (
//         <ProfileCard profile={p} key={p.profileUrl} />
//       ))}
//     </div>
//   );
// }


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
          Fill in a few details above and run a search to start pulling public profile matches.
        </p>
      </div>
    );
  }


  return (
    <div className="state-block">

      <h3>No matches on record.</h3>

      <p>
        Nothing public was indexed for this combination.
        Try loosening a field and search again.
      </p>

    </div>
  );
}




export function ErrorState({ message, onRetry }) {

  return (

    <div className="state-block error">

      <h3>The search hit a snag.</h3>

      <p>
        {message || "Something went wrong on our end."}
      </p>


      {onRetry && (

        <button
          className="btn-search"
          style={{ marginTop: 16 }}
          onClick={onRetry}
        >
          Try again
        </button>

      )}

    </div>

  );

}





export default function ResultsGrid({ results = [] }) {


  if (!results.length) {

    return (
      <EmptyState searched={true} />
    );

  }



  return (

    <div className="card-grid">

      {results.map((profile, index) => (

        <ProfileCard

          key={index}

          profile={{

            ...profile,

            profileUrl:
              profile.profileUrl ||
              profile.linkedinUrl

          }}

        />

      ))}

    </div>

  );

}