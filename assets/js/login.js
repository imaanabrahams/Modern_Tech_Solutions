const AUTH_STORAGE_KEY = "isAuthenticated";
const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin123";
let authUser = null;

function redirectToApp() {
  window.location.replace("/index.html");
}

async function loadCredentials() {
  if (authUser) return authUser;

  try {
    const response = await fetch("./data/user.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load credentials");
    authUser = await response.json();
  } catch (error) {
    authUser = { username: DEMO_USERNAME, password: DEMO_PASSWORD };
  }

  return authUser;
}

if (localStorage.getItem(AUTH_STORAGE_KEY) === "true") {
  redirectToApp();
}

function setError(field, message) {
  const error = document.getElementById(`${field}-error`);
  const border = document.getElementById(`${field}-border`);
  if (error) {
    error.hidden = false;
    error.textContent = `⚠ ${message}`;
  }
  border?.classList.add("error");
}

function clearError(field) {
  const error = document.getElementById(`${field}-error`);
  const border = document.getElementById(`${field}-border`);
  if (error) {
    error.hidden = true;
    error.textContent = "";
  }
  border?.classList.remove("error");
}

function showMessage(message, isError = false) {
  const button = document.getElementById("login-submit");
  if (!button) return;
  button.disabled = isError;
  button.textContent = isError ? "INITIALIZE SESSION" : "AUTHENTICATING...";
}

async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username")?.value.trim() || "";
  const password = document.getElementById("password")?.value.trim() || "";

  clearError("username");
  clearError("password");

  if (!username) {
    setError("username", "Username required");
    return;
  }

  if (!password) {
    setError("password", "Password required");
    return;
  }

  showMessage("Authenticating...", false);
  const credentials = await loadCredentials();

  if (username === credentials.username && password === credentials.password) {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    showMessage("ACCESS GRANTED", false);
    setTimeout(redirectToApp, 220);
  } else {
    showMessage("Invalid credentials", true);
    setError("username", "Invalid credentials");
    const card = document.getElementById("login-card");
    card?.classList.add("shake");
    setTimeout(() => card?.classList.remove("shake"), 650);
  }
}

document.getElementById("login-form")?.addEventListener("submit", handleLogin);
document
  .getElementById("username")
  ?.addEventListener("input", () => clearError("username"));
document
  .getElementById("password")
  ?.addEventListener("input", () => clearError("password"));
