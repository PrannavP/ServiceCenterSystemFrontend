import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../styles/sidebar.css";
import useAuthApi from "../../api/useAuthApi";
import { useAuth } from "../../context/AuthContext";
import { MdAssignment, MdDashboard, MdDescription, MdInventory2, MdReceiptLong, MdPeople } from "react-icons/md";
import { FiChevronLeft, FiChevronRight, FiMoon, FiSun } from "react-icons/fi";
import { getTheme, toggleTheme } from "../../utils/theme";

const iconMap = {
    dashboard: MdDashboard,
    bill: MdReceiptLong,
    receipt: MdDescription,
    card: MdAssignment,
    parts: MdInventory2,
    users: MdPeople
};

export default function Sidebar({ mobileOpen, setMobileOpen }) {
    const { callApi } = useAuthApi();
    const { user, logout } = useAuth();
    const [menus, setMenus] = useState([]);
    const [collapsed, setCollapsed] = useState(() => {
        // Always start collapsed on mobile if they have that logic, but we handle it via CSS anyway
        return window.innerWidth < 768 ? false : localStorage.getItem("sidebar.collapsed") === "1";
    });
    const [theme, setTheme] = useState(getTheme());

    useEffect(() => {
        const fetchMenus = async () => {
            const userId = user?.id || user?.userId || user?.sub || 1;

            try {
                const response = await callApi({
                    url: `/api/menu/getmenu/${userId}`,
                    method: "GET",
                    skipAuthRedirect: true,
                });

                let fetchedMenus = [];
                if (Array.isArray(response) && response.length > 0) {
                    fetchedMenus = response;
                } else if (response?.menus && Array.isArray(response.menus)) {
                    fetchedMenus = response.menus;
                } else if (response?.data && Array.isArray(response.data)) {
                    fetchedMenus = response.data;
                }
                
                if (user?.user_type === 'admin') {
                    fetchedMenus.push({
                        id: 999,
                        path: '/app/admin/users',
                        name: 'Service Centers',
                        icon: 'users'
                    });
                }
                setMenus(fetchedMenus);
            } catch (err) {
                console.warn("Failed to fetch custom menu items, using default sidebar menus:", err);
            }
        };

        fetchMenus();
    }, [user, callApi]);

    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem("sidebar.collapsed", next ? "1" : "0");
            return next;
        });
    };

    const onToggleTheme = () => setTheme(toggleTheme());

    return (
        <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
            <div className="sidebar-top">
                <div className="sidebar-logo">
                    <span className="logo-badge">AP</span>
                    {!collapsed && <span>Admin Panel</span>}
                    <button
                        className="sidebar-collapse-btn"
                        onClick={toggleCollapsed}
                        title={collapsed ? "Expand" : "Collapse"}
                        style={{ marginLeft: "auto" }}
                    >
                        {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menus.map((menu) => {
                        const Icon = iconMap[menu.icon];

                        return (
                            <NavLink
                                key={menu.id || menu.path}
                                to={menu.path}
                                title={menu.name}
                                className={({ isActive }) => (isActive ? "active" : "")}
                                onClick={() => {
                                    if (menu.path === '/app/admin/users') {
                                        localStorage.removeItem("impersonated_service_center");
                                    }
                                }}
                            >
                                {Icon && (
                                    <span className="nav-icon">
                                        <Icon size={20} />
                                    </span>
                                )}
                                {!collapsed && <span>{menu.name}</span>}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="sidebar-footer">
                <button className="sidebar-theme-btn" onClick={onToggleTheme} title="Toggle theme">
                    {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
                    {!collapsed && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
                </button>

                {user && !collapsed && (
                    <NavLink to="/app/profile" className="user-profile" style={{ textDecoration: 'none', color: 'inherit' }} title="Profile Settings">
                        <div className="avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                (user.username || "U")[0].toUpperCase()
                            )}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user.username.toUpperCase() || "User"}</div>
                            <div className="user-role">{user.user_type || "Admin"}</div>
                        </div>
                    </NavLink>
                )}
                <button className="logout-btn" onClick={logout} title="Sign Out">
                    {collapsed ? "⎋" : "Logout"}
                </button>
            </div>
        </aside>
    );
}
