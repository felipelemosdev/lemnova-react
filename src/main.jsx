import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Ordem de import preservada de index.html: base.css primeiro, theme-dark.css por
// último (precisa vencer o cascade — ver comentário no topo do próprio arquivo).
import "./styles/base.css";
import "./styles/justitia.css";
import "./styles/login.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/dashboard.css";
import "./styles/clients.css";
import "./styles/documents.css";
import "./styles/agenda.css";
import "./styles/tasks.css";
import "./styles/kits.css";
import "./styles/chat-messages.css";
import "./styles/print.css";
import "./styles/responsive.css";
import "./styles/inline-styles.css";
import "./styles/theme-dark.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);
