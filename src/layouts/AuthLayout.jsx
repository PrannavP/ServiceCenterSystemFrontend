import { Outlet } from "react-router-dom";
import { FiAperture, FiCheckCircle } from "react-icons/fi";
import "../styles/authlayout.css";

export default function AuthLayout() {
    return (
        <div className="auth-layout-wrapper">
            <div className="auth-split-container">
                <div className="auth-panel-left">
                    <div className="brand-logo">
                        <FiAperture size={32} />
                        <span>ServiceCenter</span>
                    </div>
                    
                    <div className="auth-hero-content">
                        <h2>Streamline Your Service Operations</h2>
                        <p>Join thousands of service centers already managing their jobs, parts, and billing in one unified platform.</p>
                        
                        <ul className="auth-benefits">
                            <li><FiCheckCircle className="benefit-icon" /> Track repairs end-to-end</li>
                            <li><FiCheckCircle className="benefit-icon" /> Automated inventory alerts</li>
                            <li><FiCheckCircle className="benefit-icon" /> One-click professional billing</li>
                        </ul>
                    </div>

                    <div className="auth-bg-shapes">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                    </div>
                </div>
                
                <div className="auth-panel-right">
                    <div className="auth-form-container">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}