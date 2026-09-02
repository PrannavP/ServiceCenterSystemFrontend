import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/SideBar/SideBar";
import ChatWidget from "../components/Chatbot/ChatWidget";
import { FiMenu } from "react-icons/fi";
import "../styles/baselayout.css";

export default function BaseLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Close menu when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (mobileMenuOpen && !e.target.closest('.sidebar') && !e.target.closest('.mobile-header')) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mobileMenuOpen]);

    return (
        <div className="base-layout">
            <div className="mobile-header">
                <div className="mobile-brand">
                    <span className="logo-badge">AP</span>
                    <span>Admin Panel</span>
                </div>
                <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <FiMenu size={24} />
                </button>
            </div>
            
            <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
            
            <main className="base-content" onClick={() => mobileMenuOpen && setMobileMenuOpen(false)}>
                <Outlet />
            </main>
            
            <ChatWidget />
            
            {mobileMenuOpen && <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>}
        </div>
    );
}