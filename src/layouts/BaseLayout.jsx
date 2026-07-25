import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar/SideBar";
import "../styles/baselayout.css";

export default function BaseLayout() {
    return (
        <div className="base-layout">
            <Sidebar />
            <main className="base-content">
                <Outlet />
            </main>
        </div>
    );
}