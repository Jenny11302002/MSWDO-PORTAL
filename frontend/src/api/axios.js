import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    headers: {
        Accept: "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = config.url?.startsWith("/client/")
        ? localStorage.getItem("client_token")
        : localStorage.getItem("staff_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;