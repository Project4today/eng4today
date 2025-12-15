// src/config.js
// This will look for VITE_API_BASE_URL in the environment.
// If not found (like in local dev without a .env file), it uses localhost.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";