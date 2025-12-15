// src/config.js
// This will look for VITE_API_BASE_URL in the environment.
// If not found (like in local dev without a .env file), it uses localhost.
const envUrl = import.meta.env.VITE_API_BASE_URL;
let apiUrl = envUrl || "http://localhost:8000/api";

// Fix: Ensure the URL starts with http:// or https://
// Otherwise, the browser treats it as a relative path (e.g. frontend.com/backend.com/api)
if (!apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
  apiUrl = `https://${apiUrl}`;
}

export const API_BASE_URL = apiUrl;