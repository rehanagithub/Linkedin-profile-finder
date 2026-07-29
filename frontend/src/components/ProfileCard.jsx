// function initials(name) {
//   if (!name) return "??";
//   return name
//     .split(" ")
//     .filter(Boolean)
//     .slice(0, 2)
//     .map((n) => n[0].toUpperCase())
//     .join("");
// }

// export default function ProfileCard({ profile }) {
//   const { name, jobTitle, company, location, profileUrl, snippet, relevance } = profile;

//   return (
//     <article className="profile-card">
//       <div className="card-top">
//         <span className="card-tab">{initials(name)}</span>
//         <span className="match-score">{Math.round((relevance ?? 0) * 100)}% match</span>
//       </div>

//       <h3 className="profile-name">{name || "Name not indexed"}</h3>
//       {jobTitle && <p className="profile-title">{jobTitle}</p>}

//       <div className="profile-meta">
//         {company && (
//           <span>
//             <span className="icon">Co.</span>
//             {company}
//           </span>
//         )}
//         {location && (
//           <span>
//             <span className="icon">Loc.</span>
//             {location}
//           </span>
//         )}
//       </div>

//       {snippet && <p className="profile-snippet">{snippet}</p>}

//       <a
//         className="profile-link"
//         href={profileUrl}
//         target="_blank"
//         rel="noopener noreferrer nofollow"
//       >
//         View LinkedIn profile ↗
//       </a>
//     </article>
//   );
// }


function initials(name) {
  if (!name) return "??";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}


export default function ProfileCard({ profile }) {

  const {
    name,
    jobTitle,
    company,
    location,
    profileUrl,
    linkedinUrl,
    snippet,
    description,
    relevance
  } = profile || {};


  const linkedinProfileUrl =
    profileUrl || linkedinUrl;


  const profileDescription =
    snippet || description;



  return (

    <article className="profile-card">


      <div className="card-top">

        <span className="card-tab">
          {initials(name)}
        </span>


        <span className="match-score">
          {Math.round((relevance ?? 1) * 100)}% match
        </span>

      </div>




      <h3 className="profile-name">

        {name || "Name not indexed"}

      </h3>




      {jobTitle && (

        <p className="profile-title">
          {jobTitle}
        </p>

      )}






      <div className="profile-meta">


        {company && (

          <span>

            <span className="icon">
              Co.
            </span>

            {company}

          </span>

        )}




        {location && (

          <span>

            <span className="icon">
              Loc.
            </span>

            {location}

          </span>

        )}



      </div>






      {profileDescription && (

        <p className="profile-snippet">

          {profileDescription}

        </p>

      )}






      {linkedinProfileUrl ? (

        <a
          className="profile-link"
          href={linkedinProfileUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >

          View LinkedIn profile ↗

        </a>

      ) : (

        <span className="profile-link disabled">

          Profile URL unavailable

        </span>

      )}



    </article>

  );

}