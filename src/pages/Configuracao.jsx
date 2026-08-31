// src/pages/Configuracao.jsx
// Migrado de: <section id="settingsSection"> em index.html + renderSettingsInfo() de
// js/auth.js + toda a lógica de tema de js/theme.js.
//
// Diferente das outras páginas (ainda placeholder), esta já fica 100% funcional nesta
// fase: tema, sessão e armazenamento fazem parte da "casca" do sistema, não de um módulo
// de negócio que ainda será migrado.

import { useApp } from "../context/AppContext.jsx";
import { useTheme } from "../hooks/useTheme.js";
import { getStorageModeLabel } from "../services/api.js";

export default function Configuracao() {
    const { session, logout, clients, documents, finance, events, tasks, installments } = useApp();
    const { theme, toggleTheme } = useTheme();

    const totalRecords =
        clients.length + documents.length + finance.length + events.length + tasks.length + installments.length;

    return (
        <section id="settingsSection" className="content-section active-section">
            <div className="settings-list">
                <section className="workspace-panel">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">Aparência</p>
                            <h3>Tema do sistema</h3>
                        </div>
                    </div>

                    <label className="switch-row" htmlFor="themeToggleSwitch">
                        <div>
                            <strong>Tema escuro</strong>
                            <span>Deixa as telas do sistema com fundo escuro. A escolha fica salva neste navegador.</span>
                        </div>
                        <span className="switch">
                            <input
                                type="checkbox"
                                id="themeToggleSwitch"
                                checked={theme === "dark"}
                                onChange={toggleTheme}
                            />
                            <span className="switch-track" aria-hidden="true"></span>
                        </span>
                    </label>
                </section>

                <section className="workspace-panel">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">Configuração</p>
                            <h3>Sobre o sistema</h3>
                        </div>
                    </div>

                    <div className="compact-list">
                        <div className="compact-item">
                            <span>Sistema</span>
                            <strong>Lemnova CRM Jurídico</strong>
                        </div>
                        <div className="compact-item">
                            <span>Versão</span>
                            <strong>0.2.0 · React · BETA</strong>
                        </div>
                        <div className="compact-item">
                            <span>Armazenamento</span>
                            <strong>{getStorageModeLabel()}</strong>
                        </div>
                        <div className="compact-item">
                            <span>Registros no sistema</span>
                            <strong>{totalRecords} registro(s)</strong>
                        </div>
                    </div>
                </section>

                <section className="workspace-panel">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">Sessão</p>
                            <h3>Usuário conectado</h3>
                        </div>
                    </div>

                    <div className="compact-list">
                        <div className="compact-item">
                            <span>Usuário</span>
                            <strong>{session?.user || "—"}</strong>
                        </div>
                        <div className="compact-item">
                            <span>Login em</span>
                            <strong>{session?.loggedAt ? new Date(session.loggedAt).toLocaleString("pt-BR") : "—"}</strong>
                        </div>
                    </div>

                    <p className="field-hint">
                        A troca de senha e o gerenciamento de outros usuários serão liberados quando o login por
                        usuário/senha individual (backend próprio) estiver ativo.
                    </p>

                    <button id="settingsLogoutButton" className="btn btn-danger" type="button" onClick={logout}>
                        Encerrar sessão
                    </button>
                </section>
            </div>
        </section>
    );
}
