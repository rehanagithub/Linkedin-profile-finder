// import { useState } from "react";

// const FIELDS = [
//   { key: "name", label: "Name", placeholder: "e.g. Ananya Rao" },
//   { key: "title", label: "Job title", placeholder: "e.g. Product Manager" },
//   { key: "company", label: "Company", placeholder: "e.g. Razorpay" },
//   { key: "location", label: "Location", placeholder: "e.g. Bengaluru" },
//   { key: "industry", label: "Industry", placeholder: "e.g. Fintech" },
//   { key: "keywords", label: "Keywords / skills", placeholder: "e.g. SQL, Figma, growth" },
// ];

// const EMPTY = { name: "", title: "", company: "", location: "", industry: "", keywords: "" };

// export default function SearchForm({ onSearch, loading }) {
//   const [values, setValues] = useState(EMPTY);

//   const hasAnyValue = Object.values(values).some((v) => v.trim());

//   function handleChange(key, value) {
//     setValues((prev) => ({ ...prev, [key]: value }));
//   }

//   function handleSubmit(e) {
//     e.preventDefault();
//     if (!hasAnyValue || loading) return;
//     onSearch(values);
//   }

//   function handleClear() {
//     setValues(EMPTY);
//   }

//   return (
//     <form className="search-card" onSubmit={handleSubmit}>
//       <div className="field-grid">
//         {FIELDS.map((f) => (
//           <div className="field" key={f.key}>
//             <label htmlFor={f.key}>{f.label}</label>
//             <input
//               id={f.key}
//               type="text"
//               placeholder={f.placeholder}
//               value={values[f.key]}
//               onChange={(e) => handleChange(f.key, e.target.value)}
//               maxLength={120}
//             />
//           </div>
//         ))}
//       </div>

//       <div className="form-actions">
//         <span className="hint">Fill in at least one field — more fields sharpen the match.</span>
//         <div style={{ display: "flex", gap: 10 }}>
//           <button type="button" className="btn-clear" onClick={handleClear} disabled={loading}>
//             Clear
//           </button>
//           <button type="submit" className="btn-search" disabled={!hasAnyValue || loading}>
//             {loading ? "Searching…" : "Find profiles"}
//           </button>
//         </div>
//       </div>
//     </form>
//   );
// }
// import { useState } from "react";

// const INDUSTRY_OPTIONS = [
//   "Information Technology",
//   "Software Development",
//   "Financial Services",
//   "Banking",
//   "Healthcare",
//   "Pharmaceuticals",
//   "E-commerce",
//   "Education",
//   "Telecommunications",
//   "Manufacturing",
//   "Automotive",
//   "Consulting",
//   "Retail",
//   "Real Estate",
//   "Marketing & Advertising",
//   "Hospitality",
//   "Logistics & Supply Chain",
//   "Media & Entertainment",
//   "Government",
//   "Non-Profit",
// ];

// const FIELDS = [
//   {
//     key: "title",
//     label: "Job Title",
//     placeholder: "e.g. Software Engineer",
//     type: "text",
//   },
//   {
//     key: "company",
//     label: "Company",
//     placeholder: "e.g. Microsoft",
//     type: "text",
//   },
//   {
//     key: "industry",
//     label: "Industry",
//     type: "select",
//     options: INDUSTRY_OPTIONS,
//   },
//   {
//     key: "skills",
//     label: "Skills",
//     placeholder: "e.g. React, Node.js, AWS",
//     type: "text",
//   },
//   {
//     key: "location",
//     label: "Location",
//     placeholder: "e.g. Hyderabad",
//     type: "text",
//   },
// ];

// const EMPTY = {
//   name: "",
//   title: "",
//   company: "",
//   location: "",
//   industry: "",
//   skills: "",
// };

// export default function SearchForm({ onSearch, loading }) {
//   const [values, setValues] = useState(EMPTY);

//   const hasAnyValue = Object.values(values).some(
//     (value) => value.trim() !== ""
//   );

//   function handleChange(key, value) {
//     setValues((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//   }

//   function handleSubmit(e) {
//     e.preventDefault();

//     if (!hasAnyValue || loading) return;

//     onSearch(values);
//   }

//   function handleClear() {
//     setValues(EMPTY);
//   }

//   return (
//     <form className="search-card" onSubmit={handleSubmit}>
//       <div className="field-grid">
//         {FIELDS.map((field) => (
//           <div className="field" key={field.key}>
//             <label htmlFor={field.key}>{field.label}</label>

//             {field.type === "select" ? (
//               <select
//                 id={field.key}
//                 value={values[field.key]}
//                 onChange={(e) => handleChange(field.key, e.target.value)}
//               >
//                 <option value="">Any industry</option>
//                 {field.options.map((opt) => (
//                   <option key={opt} value={opt}>
//                     {opt}
//                   </option>
//                 ))}
//               </select>
//             ) : (
//               <input
//                 id={field.key}
//                 type="text"
//                 placeholder={field.placeholder}
//                 value={values[field.key]}
//                 onChange={(e) =>
//                   handleChange(field.key, e.target.value)
//                 }
//                 maxLength={120}
//               />
//             )}
//           </div>
//         ))}
//       </div>

//       <div className="form-actions">
//         <span className="hint">
//           Enter Job Title, Company, Industry, Skills and/or Location to find matching LinkedIn profiles.
//         </span>

//         <div style={{ display: "flex", gap: 10 }}>
//           <button
//             type="button"
//             className="btn-clear"
//             onClick={handleClear}
//             disabled={loading}
//           >
//             Clear
//           </button>

//           <button
//             type="submit"
//             className="btn-search"
//             disabled={!hasAnyValue || loading}
//           >
//             {loading ? "Searching..." : "Find Profiles"}
//           </button>
//         </div>
//       </div>
//     </form>
//   );
// }

import { useState } from "react";

// const INDUSTRY_OPTIONS = [
//   "Information Technology",
//   "Software Development",
//   "Financial Services",
//   "Banking",
//   "Healthcare",
//   "Pharmaceuticals",
//   "E-commerce",
//   "Education",
//   "Telecommunications",
//   "Manufacturing",
//   "Automotive",
//   "Consulting",
//   "Retail",
//   "Real Estate",
//   "Marketing & Advertising",
//   "Hospitality",
//   "Logistics & Supply Chain",
//   "Media & Entertainment",
//   "Government",
//   "Non-Profit",
// ];

const FIELDS = [
  {
    key: "title",
    label: "Job Title",
    placeholder: "e.g. Software Engineer",
    type: "text",
  },
  {
    key: "company",
    label: "Company",
    placeholder: "e.g. Microsoft",
    type: "text",
  },
  // {
  //   key: "industry",
  //   label: "Industry",
  //   type: "select",
  //   options: INDUSTRY_OPTIONS,
  // },
  {
    key: "skills",
    label: "Skills",
    placeholder: "e.g. React, Node.js, AWS",
    type: "text",
  },
  {
    key: "location",
    label: "Location",
    placeholder: "e.g. Hyderabad",
    type: "text",
  },
];

const EMPTY = {
  name: "",
  title: "",
  company: "",
  location: "",
  industry: "",
  skills: "",
};

export default function SearchForm({ onSearch, loading }) {
  const [values, setValues] = useState(EMPTY);

  const hasAnyValue = Object.values(values).some(
    (value) => value.trim() !== ""
  );

  function handleChange(key, value) {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!hasAnyValue || loading) return;

    onSearch(values);
  }

  function handleClear() {
    setValues(EMPTY);
  }

  return (
    <form className="search-card" onSubmit={handleSubmit}>
      <div className="field-grid">
        {FIELDS.map((field) => (
          <div className="field" key={field.key}>
            <label htmlFor={field.key}>{field.label}</label>

            {field.type === "select" ? (
              <select
                id={field.key}
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  color: "#111827",
                  background: "#FFFFFF",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  backgroundImage:
                    "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  backgroundSize: "15px",
                  paddingRight: "34px",
                }}
              >
                <option value="">Any industry</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.key}
                type="text"
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={(e) =>
                  handleChange(field.key, e.target.value)
                }
                maxLength={120}
              />
            )}
          </div>
        ))}
      </div>

      <div className="form-actions">
        <span className="hint">
          Enter Job Title, Company, Industry, Skills and/or Location to find matching LinkedIn profiles.
        </span>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className="btn-clear"
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </button>

          <button
            type="submit"
            className="btn-search"
            disabled={!hasAnyValue || loading}
          >
            {loading ? "Searching..." : "Find Profiles"}
          </button>
        </div>
      </div>
    </form>
  );
}