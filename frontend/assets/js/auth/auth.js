// /js/auth/auth.js
import { post } from "../api/client.js";

const FRONTEND_BASE = "/CasaAzul/frontend";

export function checkAuth() {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  if (!user || !token) {
    window.location.href = `${FRONTEND_BASE}/login.html`;
  }
}

export async function handleLogout() {
  try {
    await post("/auth/logout", {});
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
  }
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = `${FRONTEND_BASE}/login.html`;
}
