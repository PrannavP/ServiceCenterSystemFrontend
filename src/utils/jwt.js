export function extractToken(data) {
    if (!data) return null;
    if (typeof data === "string") return data.trim();
    if (typeof data === "object") {
        if (typeof data.token === "string") return data.token.trim();
        if (typeof data.accessToken === "string") return data.accessToken.trim();
        if (typeof data.jwt === "string") return data.jwt.trim();
        if (typeof data.access_token === "string") return data.access_token.trim();
        if (typeof data.data === "string") return data.data.trim();
        if (data.data && typeof data.data === "object" && typeof data.data.token === "string") {
            return data.data.token.trim();
        }
    }
    return null;
}

export function parseJwt(token) {
    if (!token || typeof token !== "string") return null;

    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payload = parts[1];
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error parsing JWT token:", e);
        return null;
    }
}

export function isTokenExpired(token) {
    const parsed = parseJwt(token);
    if (!parsed || !parsed.exp) return false;

    const currentTime = Date.now() / 1000;
    return parsed.exp < currentTime;
}
