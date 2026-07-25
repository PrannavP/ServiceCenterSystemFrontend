import { toast } from "react-toastify";
import { apiClient } from "./apiClient";
import { useAuth } from "../context/AuthContext";

export default function useLogin() {
    const { login } = useAuth();

    const loginUser = async (username, password) => {
        try {
            const response = await apiClient({
                url: "/api/user/login",
                method: "POST",
                body: {
                    username,
                    password,
                },
            });

            if (response && response.error_code === "1") {
                toast.error(response.message || "Login failed");
                return null;
            }

            if (response && response.message) {
                toast.success(response.message);
            }

            const authData = response.data !== undefined ? response.data : response;
            login(authData);

            return authData;
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.response?.data?.message || "Network Error");
            return null;
        }
    };

    return { loginUser };
}