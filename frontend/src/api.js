// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const API_BASE= import.meta.env.VITE_API_BASE || "https://linkedin-profile-finder-3.onrender.com";

export async function searchProfiles(criteria) {
  const res = await fetch(`${API_BASE}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(criteria),
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || "Search failed");
    error.code = data.error;
    throw error;
  }

  return data;
}
