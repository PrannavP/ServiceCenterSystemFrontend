import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { router } from "./router";
import { AuthProvider } from "../context/AuthContext";

function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />

            <ToastContainer
                position="top-right"
                autoClose={3000}
                newestOnTop
            />
        </AuthProvider>
    );
}

export default App;