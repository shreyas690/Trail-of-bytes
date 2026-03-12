import axios from "axios";

const http = axios.create({
  baseURL: "/api",
  withCredentials: true
});

// Add request interceptor to include token in headers
http.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("teamToken") || sessionStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginTeam = (payload) => http.post("/auth/team-login", payload);
export const fetchLobby = () => http.get("/admin/dashboard");
export const fetchLeaderboard = () => http.get("/leaderboard");

export default http;

