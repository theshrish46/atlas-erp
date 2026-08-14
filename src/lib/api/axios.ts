import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach auth token automatically
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("authToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

// Handle global auth failures
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                localStorage.removeItem("authToken");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    },
);