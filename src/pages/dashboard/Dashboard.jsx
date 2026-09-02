import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useAuthApi from "../../api/useAuthApi";
import { FiUsers, FiFileText, FiTool, FiTrendingUp, FiPlus, FiClock, FiCheckCircle } from "react-icons/fi";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import "../../styles/dashboard.css";

const money = (n) => "Rs. " + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const timeAgo = (raw) => {
    const dt = new Date(raw);
    if (isNaN(dt.getTime())) return "";
    const diff = Date.now() - dt.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

export default function Dashboard() {
    const { user } = useAuth();
    const { callApi } = useAuthApi();

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            const res = await callApi({ url: "/api/dashboard/summary", method: "GET" });
            if (isMounted) {
                setSummary(res || null);
                setLoading(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, []);

    const s = summary || {};
    const revenueSeries = s.revenueSeries || [];
    const jobcardSeries = s.jobcardSeries || [];
    const recent = s.recent || [];

    const stats = [
        { title: "Active Jobs", value: loading ? "…" : s.activeJobs ?? 0, icon: <FiFileText size={20} />, to: "/app/jobcard", hint: "Currently open job cards" },
        { title: "Total Parts", value: loading ? "…" : s.totalParts ?? 0, icon: <FiTool size={20} />, to: "/inv/part", hint: "In the catalogue" },
        { title: "Created Today", value: loading ? "…" : s.createdToday ?? 0, icon: <FiCheckCircle size={20} />, to: "/app/jobcard", hint: "New job cards today" },
        { title: "Pending Billing", value: loading ? "…" : s.pendingBilling ?? 0, icon: <FiClock size={20} />, to: "/app/billing", hint: "Job cards not yet billed" },
        { title: "Customers", value: loading ? "…" : s.totalCustomers ?? 0, icon: <FiUsers size={20} />, to: "/app/jobcard", hint: "Unique customers served" },
        { title: "Revenue", value: loading ? "…" : money(s.revenueTotal), icon: <FiTrendingUp size={20} />, to: "/app/billing", hint: `This month: ${money(s.revenueMonth)}` },
    ];

    return (
        <div className="dashboard-container">
            {localStorage.getItem("impersonated_service_center") && (
                <div className="impersonation-banner" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', padding: '12px 20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' }}>
                    <FiUsers size={20} />
                    <span>You are currently viewing this dashboard as <strong>Service Center ID: {localStorage.getItem("impersonated_service_center")}</strong>. Actions taken here will affect their account.</span>
                    <button 
                        onClick={() => { localStorage.removeItem("impersonated_service_center"); window.location.reload(); }} 
                        style={{ marginLeft: 'auto', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.25)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
                    >
                        Exit Impersonation
                    </button>
                </div>
            )}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard</h1>
                    <p className="dashboard-subtitle">
                        Welcome back, {user?.username || "Admin"}! Here is an overview of your system.
                    </p>
                </div>
                <div className="dashboard-quick-actions">
                    <Link to="/app/jobcard/manage" className="action-btn primary">
                        <FiPlus size={18} />
                        New Job Card
                    </Link>
                    <Link to="/inv/part/manage" className="action-btn">
                        <FiPlus size={18} />
                        Add Part
                    </Link>
                </div>
            </div>

            <div className="dashboard-stats-grid">
                {stats.map((stat) => (
                    <Link to={stat.to} className="stat-card" key={stat.title}>
                        <div className="stat-header">
                            <span className="stat-title">{stat.title}</span>
                            <div className="stat-icon">{stat.icon}</div>
                        </div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-trend neutral">
                            <span>{stat.hint}</span>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="dashboard-content-grid">
                <div className="dashboard-panel chart-panel">
                    <div className="panel-header">
                        <h3 className="panel-title">Revenue (Last 7 Days)</h3>
                        <div className="stat-trend positive">
                            <FiTrendingUp size={14} />
                            <span>{money(s.revenueMonth)} this month</span>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs ${value}`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <Tooltip
                                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                                    formatter={(value) => [money(value), "Revenue"]}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="dashboard-panel chart-panel">
                    <div className="panel-header">
                        <h3 className="panel-title">Job Cards (Last 7 Days)</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={jobcardSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                                    formatter={(value) => [value, "Job Cards"]}
                                />
                                <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="dashboard-content-grid" style={{ marginTop: "0px" }}>
                <div className="dashboard-panel">
                    <div className="panel-header">
                        <h3 className="panel-title">Recent Activity</h3>
                        <Link to="/app/jobcard" className="view-all-link">View all</Link>
                    </div>
                    <div className="activity-list">
                        {loading && <div className="activity-item"><span className="activity-text">Loading...</span></div>}
                        {!loading && recent.length === 0 && (
                            <div className="activity-item"><span className="activity-text">No recent job cards.</span></div>
                        )}
                        {recent.map((item) => (
                            <div className="activity-item" key={item.id}>
                                <div className="activity-icon"><FiFileText size={16} /></div>
                                <div className="activity-details">
                                    <span className="activity-text">
                                        Job Card <b>#JC-{item.id}</b> for <b>{item.customer_name || "customer"}</b>
                                        {item.vehicle_registration_number ? ` (${item.vehicle_registration_number})` : ""}.
                                    </span>
                                    <span className="activity-time">{timeAgo(item.created_at)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
