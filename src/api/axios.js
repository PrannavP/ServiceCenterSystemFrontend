import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:6969",
    timeout: 15000,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token && token !== "[object Object]") {
            config.headers["x-auth-token"] = token;
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;