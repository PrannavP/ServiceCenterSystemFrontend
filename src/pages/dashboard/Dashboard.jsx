import { useAuth } from "../../context/AuthContext";
import "../../styles/listpage.css";

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="page-subtitle">
                        Welcome back, {user?.username}! Here is an overview of your system.
                    </p>
                </div>
            </div>
        </div>
    );
};