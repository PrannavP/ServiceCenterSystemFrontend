import axiosInstance from "./axios";

export async function apiClient({
    url,
    method = "GET",
    body = {},
    params = {},
    headers = {},
}) {
    const response = await axiosInstance({
        url,
        method,
        data: method !== "GET" ? body : undefined,
        params,
        headers,
    });

    return response.data;
}