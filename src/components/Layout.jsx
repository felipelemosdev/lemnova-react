// src/components/Layout.jsx
// Migrado de: <section id="systemView"> em index.html (o "casco" do sistema depois do
// login: sidebar + topbar + área de conteúdo + Justitia flutuante). Cada página migrada
// entra no lugar de <Outlet /> através das rotas definidas em App.jsx.

import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar.jsx";
import Header from "./Header/Header.jsx";
import JustitiaWidget from "./JustitiaWidget/JustitiaWidget.jsx";
import TaskReplyModal from "./TaskReplyModal.jsx";
import { useApp } from "../context/AppContext.jsx";

const PAGE_TITLES = {
    "/": "Dashboard",
    "/clientes": "Clientes",
    "/processos": "Processos",
    "/financeiro": "Financeiro",
    "/contratos": "Contratos",
    "/agenda": "Agenda",
    "/tarefas": "Tarefas",
    "/configuracao": "Configuração"
};

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const title = PAGE_TITLES[location.pathname] || "Lemnova";
    const justitiaRef = useRef(null);
    const { activeReplyTaskId } = useApp();

    // Equivalente a showJustitiaFloating(elements.justitiaFloat) sendo chamado dentro
    // de setActiveView() no app original: toda troca de tela "acorda" a Justitia por
    // alguns segundos.
    useEffect(() => {
        justitiaRef.current?.pulse();
    }, [location.pathname]);

    return (
        <section className="system-view" aria-label="Sistema Lemnova">
            <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

            <main className="main-area">
                <Header title={title} onToggleMobileMenu={() => setMobileOpen((value) => !value)} />
                <Outlet />
            </main>

            <JustitiaWidget ref={justitiaRef} />
            <TaskReplyModal key={activeReplyTaskId ?? "closed"} />
        </section>
    );
}
