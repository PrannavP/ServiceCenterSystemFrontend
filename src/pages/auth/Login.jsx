import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useLogin from "../../api/useLogin";
import "../../styles/login.css";

export default function Login() {
    const navigate = useNavigate();
    const { loginUser } = useLogin();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            return;
        }

        setLoading(true);

        const result = await loginUser(username, password);

        setLoading(false);

        if (result) {
            navigate("/", { replace: true });
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <form className="login-card" onSubmit={handleLogin}>
                    <h1>Welcome Back</h1>

                    <p className="subtitle">Sign in to continue</p>

                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}