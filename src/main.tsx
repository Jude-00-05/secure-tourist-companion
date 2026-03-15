import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeEmailJS } from "./services/api/email.service";

// Initialize EmailJS for email functionality
initializeEmailJS();

createRoot(document.getElementById("root")!).render(<App />);
