import axios from "axios";

// TODO (before deploying): Set VITE_SERVER_URL in .env.production to the production API URL (e.g. https://your-api-domain.com)
// Create a configured axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:3000",
  withCredentials: true,
});
