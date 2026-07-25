import { Outlet } from "react-router-dom";
import "../styles/authlayout.css"

export default function AuthLayout() {

    return (
        <div className="auth-layout">

            <div className="auth-left">

                <Outlet />

            </div>


            <div className="auth-right">

                <div className="auth-brand">

                    <h1>
                        College Project
                    </h1>

                    <p>
                        Manage everything from one place.
                    </p>

                </div>

            </div>

        </div>
    );
}