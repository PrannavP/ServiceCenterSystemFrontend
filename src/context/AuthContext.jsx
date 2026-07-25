import { createContext, useContext, useState } from "react";
import { parseJwt, isTokenExpired, extractToken } from "../utils/jwt";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken && savedToken !== "[object Object]" && !isTokenExpired(savedToken)) {
            return savedToken;
        }
        if (savedToken) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
        return null;
    });

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser && savedUser !== "[object Object]") {
            try {
                return JSON.parse(savedUser);
            } catch (e) {
                // Ignore parse error
            }
        }
        const savedToken = localStorage.getItem("token");
        if (savedToken && savedToken !== "[object Object]" && !isTokenExpired(savedToken)) {
            const decoded = parseJwt(savedToken);
            if (decoded) {
                return {
                    id: decoded.id || decoded.userId || decoded.sub || 1,
                    username: decoded.username || decoded.sub || "User",
                    ...decoded,
                };
            }
        }
        return null;
    });

    const login = (data) => {
        const jwtToken = extractToken(data);
        let userData = typeof data === "object" ? (data.user || data.data || data) : null;

        if (jwtToken) {
            localStorage.setItem("token", jwtToken);
            setToken(jwtToken);

            const decoded = parseJwt(jwtToken);
            const userObj = {
                ...(typeof userData === "object" ? userData : {}),
                id: decoded?.id || decoded?.userId || decoded?.sub || (typeof userData === "object" ? userData?.id : null) || 1,
                username: decoded?.username || (typeof userData === "object" ? userData?.username : null) || decoded?.sub || "User",
                ...(decoded || {}),
            };

            localStorage.setItem("user", JSON.stringify(userObj));
            setUser(userObj);
        } else if (userData && typeof userData === "object") {
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};