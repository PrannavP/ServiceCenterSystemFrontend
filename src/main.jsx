import ReactDOM from "react-dom/client";
import "./index.css";
import "./styles/theme.css";
import { initTheme } from "./utils/theme";

import App from '../src/app/App';

initTheme();

ReactDOM.createRoot(document.getElementById("root")).render(
    <App />
);