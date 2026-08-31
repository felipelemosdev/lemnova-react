// src/pages/Dashboard.jsx
// Migrado de: <section id="dashboardSection"> em index.html + js/dashboard.js
// (renderSummary, renderDashboardTasks, renderDashboardEvents, renderContractIndicators).
//
// Observações da migração (pra você entender o que ficou de fora de propósito):
//
// 1. dashboard.js também tinha renderCalendarWidget() (mini calendário) e referências a
//    elements.dashCalendarWidget/calendarToday/calendarNextEvent — mas esses IDs não
//    existem em lugar nenhum do index.html atual. É código morto do JS original (a
//    função já tinha uma guarda "if (!elements.dashCalendarWidget) return;" logo no
//    início, então nunca rodava). Por isso o widget de calendário não aparece aqui.
//
// 2. O card "Últimas movimentações" (#dashRecentActivity) também nunca era preenchido
//    por nenhuma função JS — ficava sempre parado no texto "Nenhuma movimentação
//    recente.". Mantive o mesmo comportamento (estático) pra não inventar uma
//    funcionalidade que não existia.
//
// 3. O botão "+ Novo" de eventos abria o formulário de evento dentro da tela de Agenda
//    (setActiveView("agenda") + openEventFormModal()). Como a Agenda ainda não foi
//    migrada (é a próxima fase), por enquanto ele só navega pra lá — o modal em si volta
//    a funcionar quando migrarmos js/agenda.js.

import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import {
    calculateContractIndicators,
    getSortedEvents,
    splitTasksByDueDate
} from "../services/domain.js";
import { formatDate, todayISO } from "../services/utils.js";

const PRIORITY_LABELS = { low: "Baixa", medium: "Média", high: "Alta" };

export default function Dashboard() {
    const { clients, documents, tasks, events, installments, findClient } = useApp();

    const openTasks = tasks.filter((task) => !task.done);
    const { overdue, today: todayTasks, upcoming, done } = splitTasksByDueDate(tasks);

    const today = todayISO();
    const upcomingEvents = getSortedEvents(events).filter((eventItem) => eventItem.date >= today).slice(0, 8);

    const contractIndicators = calculateContractIndicators(installments, clients);

    return (
        <section id="dashboardSection" className="content-section active-section">
            {/* Indicadores */}
            <div className="dashboard-summary-grid">
                <article className="summary-card">
                    <span>Clientes</span>
                    <strong id="dashClientCount">{clients.length}</strong>
                    <p>Total cadastrados</p>
                </article>

                <article className="summary-card">
                    <span>Processos</span>
                    <strong id="dashProcessCount">{documents.length}</strong>
                    <p>Total cadastrados</p>
                </article>

                <article className="summary-card">
                    <span>Tarefas</span>
                    <strong id="taskOpenCount">{openTasks.length}</strong>
                    <p>Em aberto</p>
                </article>

                <article className="summary-card">
                    <span>Audiências</span>
                    <strong id="eventCount">{events.length}</strong>
                    <p>Próximos eventos</p>
                </article>
            </div>

            {/* Área principal */}
            <div className="dashboard-2x2-grid">
                {/* Próximos compromissos */}
                <section className="workspace-panel">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">Agenda</p>
                            <h3>Próximos compromissos</h3>
                        </div>

                        <Link id="dashAddEventButton" className="btn btn-primary" to="/agenda">
                            + Novo
                        </Link>
                    </div>

                    <div id="dashEventList" className="compact-list">
                        {upcomingEvents.length === 0 ? (
                            <p className="empty-state">Nenhum evento cadastrado.</p>
                        ) : (
                            upcomingEvents.map((eventItem) => {
                                const client = findClient(eventItem.clientId);
                                return (
                                    <article key={eventItem.id} className="compact-item event-item">
                                        <div>
                                            <strong>{eventItem.type}</strong>
                                            <span>
                                                {formatDate(eventItem.date)} às {eventItem.time}
                                                {client ? ` · ${client.name}` : ""}
                                            </span>
                                            {eventItem.notes ? <small>{eventItem.notes}</small> : null}
                                        </div>
                                        <div className="event-actions">
                                            <span className="status-pill">{eventItem.alert}</span>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* Tarefas */}
                <section className="workspace-panel">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">Tarefas</p>
                            <h3>Pendências</h3>
                        </div>
                    </div>

                    <div className="dashboard-task-cards">
                        <TaskColumn className="task-col-overdue" label="Atrasadas" tasks={overdue} findClient={findClient} />
                        <TaskColumn className="task-col-today" label="Hoje" tasks={todayTasks} findClient={findClient} />
                        <TaskColumn className="task-col-upcoming" label="Próximas" tasks={upcoming} findClient={findClient} />
                        <TaskColumn className="task-col-done" label="Concluídas" tasks={done} findClient={findClient} />
                    </div>
                </section>

                {/* Contratos */}
                <section className="workspace-panel">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">Contratos</p>
                            <h3>Situação dos contratos</h3>
                        </div>
                    </div>

                    <div className="finance-overview">
                        <article className="summary-card">
                            <span>Vencidos</span>
                            <strong id="dashContractsOverdue">{contractIndicators.overdue}</strong>
                            <p>Parcelas em atraso</p>
                        </article>

                        <article className="summary-card">
                            <span>Vencendo hoje</span>
                            <strong id="dashContractsDueToday">{contractIndicators.dueToday}</strong>
                            <p>Parcelas com vencimento hoje</p>
                        </article>

                        <article className="summary-card">
                            <span>Receber hoje</span>
                            <strong id="dashContractsReceiveToday">{contractIndicators.receiveToday}</strong>
                            <p>RPVs previstos para hoje</p>
                        </article>

                        <article className="summary-card">
                            <span>A vencer</span>
                            <strong id="dashContractsUpcoming">{contractIndicators.upcoming}</strong>
                            <p>Parcelas futuras</p>
                        </article>

                        <article className="summary-card">
                            <span>Vencido +30 dias</span>
                            <strong id="dashContractsOverdue30">{contractIndicators.overdue30}</strong>
                            <p>Atraso crítico</p>
                        </article>
                    </div>
                </section>

                {/* Atividades — estático no app original (nunca era preenchido por JS) */}
                <section className="workspace-panel">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">Atividades</p>
                            <h3>Últimas movimentações</h3>
                        </div>
                    </div>

                    <div id="dashRecentActivity" className="compact-list">
                        <p className="empty-state">Nenhuma movimentação recente.</p>
                    </div>
                </section>
            </div>
        </section>
    );
}

function TaskColumn({ className, label, tasks, findClient }) {
    return (
        <div className="task-col-mini">
            <div className={`task-column-header ${className}`}>
                <span>{label}</span>
                <span className="task-col-count">{tasks.length}</span>
            </div>

            <div className="task-column-list">
                {tasks.length === 0 ? (
                    <p className="task-col-empty">Nenhuma</p>
                ) : (
                    tasks.map((task) => {
                        const client = findClient(task.clientId);
                        const priorityLabel = PRIORITY_LABELS[task.priority] || task.priority;
                        return (
                            <div key={task.id} className={`task-dash-card priority-${task.priority}`}>
                                <strong>{task.title}</strong>
                                {client ? <span className="task-dash-client">{client.name}</span> : null}
                                <div className="task-dash-meta">
                                    <span className={`task-pill ${task.priority}`}>{priorityLabel}</span>
                                    {task.dueDate ? <span className="task-dash-date">{formatDate(task.dueDate)}</span> : null}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
