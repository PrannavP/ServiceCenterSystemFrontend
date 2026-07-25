import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../styles/sidebar.css";
import useAuthApi from "../../api/useAuthApi";
import { useAuth } from "../../context/AuthContext";
import { MdAssignment, MdDashboard, MdDescription, MdInventory2, MdReceiptLong } from "react-icons/md";

const iconMap = {
    dashboard: MdDashboard,
    bill: MdReceiptLong,
    receipt: MdDescription,   // Receipt/document
    card: MdAssignment,       // Job Card
    parts: MdInventory2,       // Parts/Inventory
};

export default function Sidebar() {
    const { callApi } = useAuthApi();
    const { user, logout } = useAuth();
    const [menus, setMenus] = useState([]);

    useEffect(() => {
        const fetchMenus = async () => {
            const userId = user?.id || user?.userId || user?.sub || 1;

            try {
                const response = await callApi({
                    url: `/api/menu/getmenu/${userId}`,
                    method: "GET",
                    skipAuthRedirect: true, // Prevent menu fetch failures from destroying login session
                });

                if (Array.isArray(response) && response.length > 0) {
                    setMenus(response);
                } else if (response?.menus && Array.isArray(response.menus)) {
                    setMenus(response.menus);
                } else if (response?.data && Array.isArray(response.data)) {
                    setMenus(response.data);
                }
            } catch (err) {
                console.warn("Failed to fetch custom menu items, using default sidebar menus:", err);
            }
        };

        fetchMenus();
    }, [user]);

    return (
        <aside className="sidebar">
            <div className="sidebar-top">
                <div className="sidebar-logo">
                    <span className="logo-badge">AP</span>
                    <span>Admin Panel</span>
                </div>

                <nav className="sidebar-nav">
                    {menus.map((menu) => {
                        const Icon = iconMap[menu.icon];

                        return (
                            <NavLink
                                key={menu.id || menu.path}
                                to={menu.path}
                                className={({ isActive }) => (isActive ? "active" : "")}
                            >
                                {Icon && (
                                    <span className="nav-icon">
                                        <Icon size={20} />
                                    </span>
                                )}
                                <span>{menu.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="sidebar-footer">
                {user && (
                    <div className="user-profile">
                        <div className="avatar">
                            {(user.username || "U")[0].toUpperCase()}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user.username || "User"}</div>
                            <div className="user-role">{user.role || "Administrator"}</div>
                        </div>
                    </div>
                )}
                <button className="logout-btn" onClick={logout} title="Sign Out">
                    Logout
                </button>
            </div>
        </aside>
    );
}