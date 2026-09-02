import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiKey, FiArrowRight, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import useAuthApi from "../../api/useAuthApi";
import "../../styles/forgotpassword.css";

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const { callApi } = useAuthApi();
    const navigate = useNavigate();

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!email) {
            setError("Email or username is required.");
            return;
        }

        setLoading(true);
        const res = await callApi({
            url: "/api/user/forgot-password",
            method: "POST",
            body: { username: email },
            showToast: true,
            skipAuthRedirect: true
        });
        setLoading(false);

        if (res) {
            setStep(2);
        } else {
            setError("Failed to send reset code. Please check your username/email.");
        }
    };

    const handleVerifyOtpAndReset = async (e) => {
        e.preventDefault();
        setError("");

        if (!otp) {
            setError("Please enter the verification code.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        const res = await callApi({
            url: "/api/user/reset-password",
            method: "POST",
            body: { username: email, otp, newPassword: password },
            showToast: true,
            skipAuthRedirect: true
        });
        setLoading(false);

        if (res) {
            setStep(3); // Success step
        } else {
            setError("Invalid verification code or password reset failed.");
        }
    };

    const getPasswordStrength = () => {
        if (!password) return 0;
        let strength = 0;
        if (password.length > 5) strength++;
        if (password.length > 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return Math.min(4, strength);
    };

    const strength = getPasswordStrength();
    const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const strengthColors = ["#ef4444", "#f59e0b", "#eab308", "#84cc16", "#22c55e"];

    return (
        <div className="forgot-password-card">
            <div className="login-header">
                <Link to="/login" className="back-link">
                    <FiArrowLeft size={16} /> Back to Login
                </Link>
                <h1>{step === 1 ? "Reset Password" : step === 2 ? "Create New Password" : "Password Reset!"}</h1>
                <p className="subtitle">
                    {step === 1 && "Enter your username or email address and we'll send you a link to reset your password."}
                    {step === 2 && "Enter the verification code sent to you and your new password."}
                    {step === 3 && "Your password has been successfully reset."}
                </p>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {step === 1 && (
                <form onSubmit={handleRequestReset}>
                    <div className="input-group">
                        <label>Username or Email</label>
                        <div className="input-wrapper">
                            <FiMail className="input-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Enter your username or email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? "Sending..." : "Send Reset Link"}
                        {!loading && <FiArrowRight size={18} />}
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyOtpAndReset}>
                    <div className="input-group">
                        <label>Verification Code</label>
                        <div className="input-wrapper">
                            <FiKey className="input-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Enter the 6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength={6}
                                style={{ letterSpacing: '4px', fontVariantNumeric: 'tabular-nums' }}
                            />
                        </div>
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
                        {password && (
                            <div className="password-strength">
                                <div className="strength-bar-container">
                                    {[0, 1, 2, 3].map((index) => (
                                        <div 
                                            key={index}
                                            className={`strength-bar ${strength > index ? 'active' : ''}`}
                                            style={{ backgroundColor: strength > index ? strengthColors[strength] : '#e2e8f0' }}
                                        ></div>
                                    ))}
                                </div>
                                <span className="strength-label" style={{ color: strengthColors[strength] }}>
                                    {strengthLabels[strength]}
                                </span>
                            </div>
                        )}
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

                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                        {!loading && <FiCheckCircle size={18} />}
                    </button>
                </form>
            )}

            {step === 3 && (
                <div className="success-state">
                    <div className="success-icon-wrapper">
                        <FiCheckCircle size={64} className="success-icon" />
                    </div>
                    <p className="success-text">
                        You can now use your new password to log in to your account.
                    </p>
                    <Link to="/login" className="login-btn" style={{ textDecoration: 'none' }}>
                        Go to Login <FiArrowRight size={18} />
                    </Link>
                </div>
            )}
        </div>
    );
}