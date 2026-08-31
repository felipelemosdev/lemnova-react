// src/components/Header/Header.jsx
// Migrado de: <header class="topbar"> em index.html + updateDateTime(), renderNotifications()
// de js/dashboard.js, renderMessagesCenter() de js/tasks.js, e os toggles de painel de
// js/dom.js.
//
// O botão de e-mail (✉️) continua "em breve" mesmo no app original — nunca foi ligado a
// nada, é um placeholder deles mesmo, não uma simplificação desta migração.

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import { useClock } from "../../hooks/useClock.js";
import { getInstallmentsAwaitingConfirmation } from "../../services/domain.js";
import { printSection, printTasksReport } from "../../services/print.js";
import { formatDate, formatCurrency, getInitials, todayISO } from "../../services/utils.js";

// Migrado de: PRINT_TARGETS + handleTopbarPrint() em js/main.js — cada rota sabe qual
// <section> imprimir (ou, no caso de Tarefas, qual relatório dedicado gerar).
const PRINT_TARGETS = {
    "/": { sectionId: "dashboardSection", title: "Dashboard" },
    "/clientes": { sectionId: "clientsSection", title: "Clientes" },
    "/processos": { sectionId: "documentsSection", title: "Processos" },
    "/financeiro": { sectionId: "financeSection", title: "Financeiro" },
    "/contratos": { sectionId: "contractsSection", title: "Contratos" },
    "/agenda": { sectionId: "agendaSection", title: "Agenda" }
};

function timeAgoLabel(isoDate) {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} d`;
    return formatDate(isoDate.slice(0, 10));
}

export default function Header({ title, onToggleMobileMenu }) {
    const { tasks, events, installments, findClient, openTaskReply } = useApp();
    const now = useClock();
    const location = useLocation();
    const [notifOpen, setNotifOpen] = useState(false);
    const [messagesOpen, setMessagesOpen] = useState(false);

    const today = todayISO();
    const overdueTasks = tasks.filter((t) => !t.done && t.dueDate && t.dueDate < today);
    const todayEvents = events.filter((eventItem) => eventItem.date === today && !eventItem.done);
    const pendingInstallments = getInstallmentsAwaitingConfirmation(installments);

    const notifItems = [
        ...overdueTasks.map((task) => ({
            key: `task-${task.id}`,
            kind: "overdue",
            title: `Tarefa atrasada: ${task.title}`,
            detail: `Prazo era ${formatDate(task.dueDate)}`
        })),
        ...todayEvents.map((eventItem) => ({
            key: `event-${eventItem.id}`,
            kind: "event",
            title: eventItem.type,
            detail: `Hoje às ${eventItem.time}`
        })),
        ...pendingInstallments.map((installment) => {
            const client = findClient(installment.clientId);
            const isOverdue = installment.dueDate < today;
            return {
                key: `inst-${installment.id}`,
                kind: "installment",
                title: `Confirmar recebimento${client ? ": " + client.name : ""}`,
                detail: `${formatCurrency(installment.amount)} · vencimento ${formatDate(installment.dueDate)}${isOverdue ? " (atrasada)" : " (hoje)"}`
            };
        })
    ];

    function handlePrintClick() {
        if (location.pathname === "/tarefas") {
            printTasksReport(tasks, findClient);
            return;
        }
        const target = PRINT_TARGETS[location.pathname];
        if (target) {
            printSection(target.sectionId, target.title);
        }
    }

    const conversations = tasks
        .filter((task) => (task.replies || []).length > 0)
        .map((task) => ({ task, lastReply: task.replies[task.replies.length - 1] }))
        .sort((a, b) => new Date(b.lastReply.createdAt) - new Date(a.lastReply.createdAt));
    const totalUnread = tasks.reduce((sum, task) => sum + (task.unreadCount || 0), 0);

    function handleOpenConversation(taskId) {
        setMessagesOpen(false);
        openTaskReply(taskId);
    }

    return (
        <header className="topbar">
            <div>
                <p className="eyebrow">Escritório jurídico</p>
                <h2 id="pageTitle">{title}</h2>
            </div>
            <div className="topbar-actions">
                <div className="clock-stack">
                    <span className="date-chip date-display">{now}</span>
                </div>

                <button
                    className="icon-button quick-action-button"
                    type="button"
                    aria-label="Abrir e-mail"
                    title="E-mail (em breve)"
                >
                    ✉️
                </button>

                <div className="msg-wrap">
                    <button
                        className="icon-button quick-action-button"
                        type="button"
                        aria-label="Mensagens internas"
                        title="Mensagens internas"
                        onClick={() => setMessagesOpen((value) => !value)}
                    >
                        💬
                        <span className={`notif-badge ${totalUnread === 0 ? "hidden" : ""}`}>
                            {totalUnread > 9 ? "9+" : totalUnread}
                        </span>
                    </button>
                    <div className={`notif-panel ${messagesOpen ? "" : "hidden"}`}>
                        <div className="notif-panel-header">Mensagens internas</div>
                        <div className="notif-panel-body">
                            {conversations.length === 0 ? (
                                <p className="empty-state">Nenhuma mensagem por enquanto.</p>
                            ) : (
                                conversations.map(({ task, lastReply }) => (
                                    <button
                                        key={task.id}
                                        type="button"
                                        className={`msg-item ${task.unreadCount ? "unread" : ""}`}
                                        onClick={() => handleOpenConversation(task.id)}
                                    >
                                        <span className="msg-item-avatar">{getInitials(task.responsible || task.from || task.title)}</span>
                                        <span className="msg-item-body">
                                            <span className="msg-item-title">
                                                <span>{task.title}</span>
                                                <span className="msg-item-time">{timeAgoLabel(lastReply.createdAt)}</span>
                                            </span>
                                            <span className="msg-item-preview">
                                                {lastReply.author || "Anônimo"}: {lastReply.text}
                                            </span>
                                        </span>
                                        {task.unreadCount ? <span className="msg-item-unread-dot" /> : null}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <button
                    className="icon-button quick-action-button"
                    type="button"
                    aria-label="Imprimir seção atual"
                    title="Imprimir"
                    onClick={handlePrintClick}
                >
                    🖨
                </button>

                <div className="notif-wrap">
                    <button
                        className="icon-button notif-button"
                        type="button"
                        aria-label="Notificações"
                        onClick={() => setNotifOpen((value) => !value)}
                    >
                        🔔
                        <span className={`notif-badge ${notifItems.length === 0 ? "hidden" : ""}`}>
                            {notifItems.length > 9 ? "9+" : notifItems.length}
                        </span>
                    </button>
                    <div className={`notif-panel ${notifOpen ? "" : "hidden"}`}>
                        <div className="notif-panel-header">Notificações</div>
                        <div className="notif-panel-body">
                            {notifItems.length === 0 ? (
                                <p className="empty-state">Nenhuma notificação por enquanto.</p>
                            ) : (
                                notifItems.map((item) => (
                                    <button key={item.key} type="button" className={`notif-item ${item.kind === "overdue" ? "overdue" : ""}`}>
                                        <strong>{item.title}</strong>
                                        <span>{item.detail}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <button className="icon-button" type="button" aria-label="Abrir menu" onClick={onToggleMobileMenu}>
                    ☰
                </button>
            </div>
        </header>
    );
}
