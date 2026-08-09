import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
// Automatically attach token to every request if user is logged in
API.interceptors.request.use((config) => {
    const user = localStorage.getItem("user");
    if (user) {
        const token = JSON.parse(user).token;
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;