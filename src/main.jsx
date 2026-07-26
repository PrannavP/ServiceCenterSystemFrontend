import React from "react";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import "./index.css";

import App from '../src/app/App';

ReactDOM.createRoot(document.getElementById("root")).render(
    // <StrictMode>
        <App />
    // {/* </StrictMode> */}
);