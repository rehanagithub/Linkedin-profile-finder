import { useState } from "react";

const FIELDS = [
  { key: "name", label: "Name", placeholder: "e.g. Ananya Rao" },
  { key: "title", label: "Job title", placeholder: "e.g. Product Manager" },
  { key: "company", label: "Company", placeholder: "e.g. Razorpay" },
  { key: "location", label: "Location", placeholder: "e.g. Bengaluru" },
  { key: "industry", label: "Industry", placeholder: "e.g. Fintech" },
  { key: "keywords", label: "Keywords / skills", placeholder: "e.g. SQL, Figma, growth" },
];

const EMPTY = { name: "", title: "", company: "", location: "", industry: "", keywords: "" };

export default function SearchForm({ onSearch, loading }) {
  const [values, setValues] = useState(EMPTY);

  const hasAnyValue = Object.values(values).some((v) => v.trim());

  function handleChange(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
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
        {FIELDS.map((f) => (
          <div className="field" key={f.key}>
            <label htmlFor={f.key}>{f.label}</label>
            <input
              id={f.key}
              type="text"
              placeholder={f.placeholder}
              value={values[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
              maxLength={120}
            />
          </div>
        ))}
      </div>

      <div className="form-actions">
        <span className="hint">Fill in at least one field — more fields sharpen the match.</span>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn-clear" onClick={handleClear} disabled={loading}>
            Clear
          </button>
          <button type="submit" className="btn-search" disabled={!hasAnyValue || loading}>
            {loading ? "Searching…" : "Find profiles"}
          </button>
        </div>
      </div>
    </form>
  );
}
