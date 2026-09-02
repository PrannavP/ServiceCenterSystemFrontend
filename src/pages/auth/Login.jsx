import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useLogin from "../../api/useLogin";
import { FiUser, FiLock, FiArrowRight, FiEye, FiEyeOff, FiAperture } from "react-icons/fi";
import "../../styles/login.css";

export default function Login() {
    const navigate = useNavigate();
    const { loginUser } = useLogin();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
            if (result.user?.force_password_change) {
                navigate("/force-password-change", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        }
    };

    return (
        <form className="login-card" onSubmit={handleLogin}>
            <div className="login-header">
                <div className="login-brand" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: '#10b981' }}>
                    <FiAperture size={48} />
                </div>
                <h1>Welcome Back</h1>
                <p className="subtitle">Sign in to continue to your dashboard.</p>
            </div>

            <div className="input-group">
                <label>Username</label>
                <div className="input-wrapper">
                    <FiUser className="input-icon" size={18} />
                    <input
                        type="text"
                        className="login-input"
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
                        type={showPassword ? "text" : "password"}
                        className="login-input"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button 
                        type="button" 
                        className="password-toggle" 
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0 10px', display: 'flex', alignItems: 'center' }}
                    >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                </div>
            </div>

            <div className="forgot-password-link">
                <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
                <span>{loading ? "Signing In..." : "Sign In"}</span>
                {!loading && <FiArrowRight size={18} />}
            </button>
        </form>
    );
}