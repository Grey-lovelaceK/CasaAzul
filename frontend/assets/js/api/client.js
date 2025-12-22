// /js/api/client.js
const API_URL = "http://localhost/CasaAzul/backend/public";

export async function post(endpoint, data) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("API POST error:", err);
    throw err;
  }
}

export async function get(endpoint) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      credentials: "include",
    });
    return await res.json();
  } catch (err) {
    console.error("API GET error:", err);
    throw err;
  }
}
