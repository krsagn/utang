import axios from "axios";

// Create a configured axios instance
export const api = axios.create({
  baseURL: "http://localhost:3000", // API Server URL
  withCredentials: true,
});

// NOT BEING USED YET
// A helper to just return the data (so we don't type .data everywhere)
// export const fetcher = (url: string) => api.get(url).then((res) => res.data);
