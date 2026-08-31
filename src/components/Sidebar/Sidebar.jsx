// src/components/Sidebar/Sidebar.jsx
// Migrado de: <aside class="sidebar"> dentro de index.html + toggleSidebarCollapse()
// e toggleMobileMenu() de js/dom.js.
//
// A navegação usava data-view + JS pra trocar seção visível (setActiveView em dom.js).
// Em React isso vira NavLink do react-router: cada item já sabe se está "active"
// sozinho, comparando com a URL atual.

import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";

const NAV_ITEMS = [
    { to: "/", icon: "▦", label: "Dashboard", end: true },
    { to: "/clientes", icon: "◇", label: "Clientes" },
    { to: "/processos", icon: "§", label: "Processos" },
    { to: "/financeiro", icon: "R$", label: "Financeiro" },
    { to: "/contratos", icon: "⏰", label: "Contratos" },
    { to: "/agenda", icon: "◷", label: "Agenda" },
    { to: "/tarefas", icon: "✓", label: "Tarefas" },
    { to: "/configuracao", icon: "⚙", label: "Configuração" }
];

export default function Sidebar({ mobileOpen, onCloseMobile }) {
    const { logout } = useApp();
    const [collapsed, setCollapsed] = useState(false);
    const autoCollapseTimer = useRef(null);

    // Equivalente a scheduleSidebarAutoCollapse() em js/dom.js: alguns segundos depois
    // de entrar no sistema, o menu recolhe sozinho (o hover em .sidebar.collapsed:hover
    // do CSS continua expandindo temporariamente quando o mouse passa por cima).
    useEffect(() => {
        autoCollapseTimer.current = window.setTimeout(() => setCollapsed(true), 5000);
        return () => window.clearTimeout(autoCollapseTimer.current);
    }, []);

    function handleToggleClick() {
        window.clearTimeout(autoCollapseTimer.current);
        setCollapsed((value) => !value);
    }

    return (
        <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`} id="sidebarEl">
            <button
                className="sidebar-brand"
                id="sidebarToggle"
                type="button"
                title="Expandir/recolher menu"
                onClick={handleToggleClick}
            >
                <div className="brand-mark" aria-hidden="true">⌂</div>
                <div className="sidebar-brand-text">
                    <strong>Lemnova</strong>
                    <span>CRM Jurídico</span>
                </div>
            </button>

            <nav className="sidebar-nav" aria-label="Menu principal">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        onClick={onCloseMobile}
                    >
                        <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <button id="logoutButton" className="btn btn-secondary sidebar-logout" type="button" onClick={logout}>
                <span className="nav-icon" aria-hidden="true">⏻</span>
                <span className="nav-label">Sair</span>
            </button>
        </aside>
    );
}
