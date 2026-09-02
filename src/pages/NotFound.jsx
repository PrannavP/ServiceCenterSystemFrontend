import { Link } from "react-router-dom";
import { FiHome, FiArrowLeft } from "react-icons/fi";
import "../styles/notfound.css";

export default function NotFound() {
    return (
        <div className="not-found-wrapper">
            <div className="not-found-content">
                <div className="error-code">404</div>
                <h1 className="error-title">Page Not Found</h1>
                <p className="error-desc">
                    Oops! The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
                </p>
                <div className="error-actions">
                    <button className="btn-secondary" onClick={() => window.history.back()}>
                        <FiArrowLeft size={18} /> Go Back
                    </button>
                    <Link to="/" className="btn-primary">
                        <FiHome size={18} /> Back to Home
                    </Link>
                </div>
            </div>
            
            <div className="floating-shapes">
                <div className="shape shape-circle"></div>
                <div className="shape shape-square"></div>
                <div className="shape shape-triangle"></div>
            </div>
        </div>
    );
}