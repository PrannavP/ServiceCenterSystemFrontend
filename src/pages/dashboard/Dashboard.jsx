import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useAuthApi from "../../api/useAuthApi";
import { FiUsers, FiFileText, FiTool, FiTrendingUp, FiPlus, FiClock, FiCheckCircle, FiDollarSign } from "react-icons/fi";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import "../../styles/dashboard.css";

const weeklyData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
];

const monthlyData = [
    { name: 'Week 1', revenue: 12000 },
    { name: 'Week 2', revenue: 15000 },
    { name: 'Week 3', revenue: 10000 },
    { name: 'Week 4', revenue: 18000 },
];

const yearlyData = [
    { name: 'Q1', revenue: 45000 },
    { name: 'Q2', revenue: 52000 },
    { name: 'Q3', revenue: 48000 },
    { name: 'Q4', revenue: 61000 },
];

export default function Dashboard() {
    const { user } = useAuth();
    const { callApi } = useAuthApi();
    const [filter, setFilter] = useState("Weekly");
    const [chartData, setChartData] = useState(weeklyData);
    
    // Real-time data state
    const [realTimeData, setRealTimeData] = useState([]);

    useEffect(() => {
        if (filter === "Weekly") setChartData(weeklyData);
        else if (filter === "Monthly") setChartData(monthlyData);
        else setChartData(yearlyData);
    }, [filter]);

    useEffect(() => {
        let isMounted = true;

        const fetchActiveUsers = async () => {
            const res = await callApi({
                url: "/api/dashboard/active-users",
                method: "GET",
                showToast: false
            });

            if (isMounted && res && res.activeUsers !== undefined) {
                setRealTimeData(prev => {
                    const newData = [...prev];
                    if (newData.length >= 15) newData.shift();
                    
                    newData.push({
                        time: new Date().toLocaleTimeString(),
                        activeUsers: res.activeUsers
                    });
                    
                    return newData;
                });
            }
        };

        // Fetch immediately, then poll
        fetchActiveUsers();
        const interval = setInterval(fetchActiveUsers, 5000);
        
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="dashboard-container">
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
                <Link to="/app/jobcard" className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Active Jobs</span>
                        <div className="stat-icon"><FiFileText size={20} /></div>
                    </div>
                    <div className="stat-value">12</div>
                    <div className="stat-trend positive">
                        <FiTrendingUp size={14} />
                        <span>+2 from yesterday</span>
                    </div>
                </Link>

                <Link to="/inv/part" className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Total Parts</span>
                        <div className="stat-icon"><FiTool size={20} /></div>
                    </div>
                    <div className="stat-value">843</div>
                    <div className="stat-trend neutral">
                        <span>Inventory level stable</span>
                    </div>
                </Link>

                <Link to="/app/jobcard" className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Completed Today</span>
                        <div className="stat-icon"><FiCheckCircle size={20} /></div>
                    </div>
                    <div className="stat-value">5</div>
                    <div className="stat-trend positive">
                        <FiTrendingUp size={14} />
                        <span>+15% avg completion</span>
                    </div>
                </Link>

                <Link to="/app/billing" className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Pending Billing</span>
                        <div className="stat-icon"><FiClock size={20} /></div>
                    </div>
                    <div className="stat-value">3</div>
                    <div className="stat-trend negative">
                        <span>Action required</span>
                    </div>
                </Link>

                <Link to="/app/jobcard" className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Total Customers</span>
                        <div className="stat-icon"><FiUsers size={20} /></div>
                    </div>
                    <div className="stat-value">148</div>
                    <div className="stat-trend positive">
                        <FiTrendingUp size={14} />
                        <span>+4 this week</span>
                    </div>
                </Link>

                <Link to="/app/billing" className="stat-card">
                    <div className="stat-header">
                        <span className="stat-title">Est. Revenue</span>
                        <div className="stat-icon"><FiDollarSign size={20} /></div>
                    </div>
                    <div className="stat-value">NRS. 4,250</div>
                    <div className="stat-trend positive">
                        <FiTrendingUp size={14} />
                        <span>+8% this month</span>
                    </div>
                </Link>
            </div>

            <div className="dashboard-content-grid">
                <div className="dashboard-panel chart-panel">
                    <div className="panel-header">
                        <h3 className="panel-title">Revenue Overview</h3>
                        <div className="filter-group">
                            <select 
                                className="chart-filter" 
                                value={filter} 
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="Weekly">This Week</option>
                                <option value="Monthly">This Month</option>
                                <option value="Yearly">This Year</option>
                            </select>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `NRS ${value}`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`NRS. ${value}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="dashboard-panel chart-panel">
                    <div className="panel-header">
                        <h3 className="panel-title">Live System Activity</h3>
                        <div className="pulse-indicator">
                            <div className="pulse-dot"></div>
                            <span>Live</span>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={realTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [value, 'Active Users']}
                                    labelFormatter={() => ''}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="activeUsers" 
                                    stroke="#f59e0b" 
                                    strokeWidth={3} 
                                    dot={false}
                                    animationDuration={300}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            {/* Keeping the recent activity below the charts */}
            <div className="dashboard-content-grid" style={{ marginTop: '0px' }}>
                <div className="dashboard-panel">
                    <div className="panel-header">
                        <h3 className="panel-title">Recent Activity</h3>
                        <Link to="/app/jobcard" className="view-all-link">View all</Link>
                    </div>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon"><FiFileText size={16} /></div>
                            <div className="activity-details">
                                <span className="activity-text">Job Card <b>#JC-004</b> was created for <b>Prannav Panta</b>.</span>
                                <span className="activity-time">2 hours ago</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon"><FiCheckCircle size={16} /></div>
                            <div className="activity-details">
                                <span className="activity-text">Job Card <b>#JC-003</b> was marked as completed.</span>
                                <span className="activity-time">5 hours ago</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="dashboard-panel">
                    <div className="panel-header">
                        <h3 className="panel-title">System Status</h3>
                    </div>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-details">
                                <span className="activity-text">Database Connection</span>
                                <span className="stat-trend positive">Healthy</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-details">
                                <span className="activity-text">System Version</span>
                                <span className="activity-time">v1.2.0-beta</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};