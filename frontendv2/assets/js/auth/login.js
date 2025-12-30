import { post } from "../api/client.js";
import { showMessage } from "../utils/ui.js";
const FRONTEND_BASE = "/CasaAzul/frontend";

const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

signUpButton?.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

signInButton?.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});

export async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const loginBtn = document.getElementById("loginBtn");

  if (!email || !password) {
    showMessage("loginMessage", "Por favor completa todos los campos", "error");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Ingresando...";

  try {
    const data = await post("/auth/login", { email, password });
    console.log("RESPUESTA BACKEND:", data);

    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("token", data.data.token);

      showMessage("loginMessage", "¡Login exitoso! Redirigiendo...", "success");

      setTimeout(() => {
        window.location.href = `${FRONTEND_BASE}/pages/dashboard.html`;
      }, 1000);
    } else {
      showMessage(
        "loginMessage",
        data.message || "Error al iniciar sesión",
        "error"
      );
      loginBtn.disabled = false;
      loginBtn.textContent = "Iniciar sesión";
    }
  } catch {
    showMessage(
      "loginMessage",
      "Error de conexión con el servidor. Verifica que el backend esté corriendo.",
      "error"
    );
    loginBtn.disabled = false;
    loginBtn.textContent = "Iniciar sesión";
  }
}

window.handleLogin = handleLogin;
