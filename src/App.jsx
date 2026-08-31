// src/App.jsx
// Raiz da aplicação: providers globais (dados + rotas) e o mapa de rotas.
//
// Migrado de: o <div id="app" class="app-shell"> de index.html, que continha as duas
// seções "loginView" / "systemView" alternadas via classList. Em React isso vira duas
// famílias de rotas: "/login" (pública) e todo o resto (protegido por <RequireAuth>,
// que redireciona para o login quando não há sessão — equivalente a hydrateSession()
// em js/auth.js).

import { Navigate, Route, Routes, BrowserRouter, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Clientes from "./pages/Clientes.jsx";
import Processos from "./pages/Processos.jsx";
import Financeiro from "./pages/Financeiro.jsx";
import Contratos from "./pages/Contratos.jsx";
import Agenda from "./pages/Agenda.jsx";
import Tarefas from "./pages/Tarefas.jsx";
import Configuracao from "./pages/Configuracao.jsx";
import Footer from "./components/Footer.jsx";

function RequireAuth({ children }) {
    const { booting, session } = useApp();
    const location = useLocation();

    if (booting) {
        // Mesmo instante em que o app original mantinha as duas telas escondidas
        // enquanto hydrateSession() ainda não tinha resolvido.
        return null;
    }

    if (!session) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route
                element={
                    <RequireAuth>
                        <Layout />
                    </RequireAuth>
                }
            >
                <Route path="/" element={<Dashboard />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/processos" element={<Processos />} />
                <Route path="/financeiro" element={<Financeiro />} />
                <Route path="/contratos" element={<Contratos />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/tarefas" element={<Tarefas />} />
                <Route path="/configuracao" element={<Configuracao />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppProvider>
                <div id="app" className="app-shell">
                    <AppRoutes />
                </div>
                <Footer />
            </AppProvider>
        </BrowserRouter>
    );
}
