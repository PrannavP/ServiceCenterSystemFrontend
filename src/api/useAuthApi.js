import { toast } from "react-toastify";
import { apiClient } from "./apiClient";
import { useAuth } from "../context/AuthContext";

export default function useAuthApi() {
    const { token, logout } = useAuth();

    const callApi = async ({
        url,
        method = "GET",
        body = {},
        params = {},
        headers = {},
        showToast = false,
        skipAuthRedirect = false,
    }) => {
        try {
            const activeToken = token || localStorage.getItem("token");

            const response = await apiClient({
                url,
                method,
                body,
                params,
                headers: {
                    ...(activeToken && activeToken !== "[object Object]"
                        ? {
                              "x-auth-token": activeToken,
                              Authorization: `Bearer ${activeToken}`,
                          }
                        : {}),
                    ...headers,
                },
            });

            if (response && (response.error_code === "1" || response.success === false)) {
                if (showToast) toast.error(response.message || "Operation failed");
                return null;
            }

            if (showToast && response && response.message) {
                toast.success(response.message);
            }

            return response && response.data !== undefined ? response.data : response;
        } catch (err) {
            console.error(`API Call Error (${url}):`, err);

            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                if (!skipAuthRedirect) {
                    toast.error("Session expired or unauthorized. Please log in again.");
                    if (logout) logout();
                }
                return null;
            }

            if (showToast) {
                toast.error(err.response?.data?.message || "Network Error");
            }
            return null;
        }
    };

    return { callApi };
}
