import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useLogin from "../../api/useLogin";
import { FiUser, FiLock, FiArrowRight } from "react-icons/fi";
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
            navigate("/dashboard", { replace: true });
        }
    };

    return (
        <form className="login-card" onSubmit={handleLogin}>
            <div className="login-header">
                <h1>Welcome Back</h1>
                <p className="subtitle">Sign in to continue to your dashboard.</p>
            </div>

            <div className="input-group">
                <label>Username</label>
                <div className="input-wrapper">
                    <FiUser className="input-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                    <FiLock className="input-icon" size={18} />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="forgot-password-link">
                <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
                {!loading && <FiArrowRight size={18} />}
            </button>
        </form>
    );
}