import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthApi from "../../api/useAuthApi";
import { FiLock, FiArrowRight, FiAperture } from "react-icons/fi";
import { toast } from "react-toastify";
import "../../styles/login.css";

export default function ForcePasswordChange() {
    const navigate = useNavigate();
    const { callApi } = useAuthApi();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        const res = await callApi({
            url: "/api/user/reset-password-forced",
            method: "POST",
            body: { newPassword: password },
            showToast: true
        });

        setLoading(false);

        if (res) {
            toast.success("Password updated successfully!");
            navigate("/dashboard", { replace: true });
        }
    };

    return (
        <form className="login-card" onSubmit={handleSubmit}>
            <div className="login-header">
                <div className="login-brand" style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#10b981', background: '#ecfdf5', width: 64, height: 64, borderRadius: '50%', alignItems: 'center' }}>
                    <FiLock size={32} />
                </div>
                <h1>Update Password</h1>
                <p className="subtitle">For security reasons, you must change your password before continuing.</p>
            </div>

            <div className="input-group">
                <label>New Password</label>
                <div className="input-wrapper">
                    <FiLock className="input-icon" size={18} />
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="input-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                    <FiLock className="input-icon" size={18} />
                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
            </div>

            <button className="login-btn" type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? "Updating..." : "Update Password"}
                {!loading && <FiArrowRight size={18} />}
            </button>
        </form>
    );
}
