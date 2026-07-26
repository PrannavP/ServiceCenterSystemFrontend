import { Outlet } from "react-router-dom";
import "../styles/authlayout.css";

export default function AuthLayout() {
    return (
        <div className="auth-layout">
            <div className="auth-content">
                <div className="auth-form-wrapper">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}