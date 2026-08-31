// src/components/tasks/TaskList.jsx
// Migrado de: <div id="taskList"> em index.html + renderTasks() de js/tasks.js.

import { useApp } from "../../context/AppContext.jsx";
import { formatDate } from "../../services/utils.js";

const PRIORITY_LABELS = { low: "Baixa", medium: "Média", high: "Alta" };
const ALERT_LABELS = {
    no_dia: "Alerta: no dia",
    "1_dia": "Alerta: 1 dia antes",
    "3_dias": "Alerta: 3 dias antes",
    "7_dias": "Alerta: 7 dias antes",
    sem_alerta: ""
};

export default function TaskList({ onDelete }) {
    const { tasks, findClient, toggleTaskDone, openTaskReply } = useApp();

    return (
        <>
            <div id="taskList" className="compact-list">
                {tasks.map((task) => {
                    const client = findClient(task.clientId);
                    const priorityLabel = PRIORITY_LABELS[task.priority] || task.priority;
                    const alertLabel = ALERT_LABELS[task.alert] || "";
                    const metaParts = [
                        task.responsible || null,
                        client ? client.name : null,
                        task.dueDate ? `Prazo: ${formatDate(task.dueDate)}` : "Sem prazo",
                        alertLabel || null
                    ].filter(Boolean);

                    return (
                        <article key={task.id} className="compact-item task-item">
                            <div>
                                <strong style={task.done ? { textDecoration: "line-through", opacity: 0.5 } : undefined}>
                                    {task.title}
                                </strong>
                                <span>{metaParts.join(" · ")}</span>
                                {task.description ? <small>{task.description}</small> : null}
                            </div>
                            <div className="event-actions">
                                <span className={`task-pill ${task.priority}`}>{priorityLabel}</span>
                                <button className="action-button reply" type="button" onClick={() => openTaskReply(task.id)}>
                                    💬 Conversa{task.replies?.length ? ` (${task.replies.length})` : ""}
                                    {task.unreadCount ? <span className="msg-item-unread-dot" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 4 }} /> : null}
                                </button>
                                <button
                                    className={`action-button ${task.done ? "" : "complete"}`}
                                    type="button"
                                    onClick={() => toggleTaskDone(task.id)}
                                >
                                    {task.done ? "↺ Reabrir" : "✓ CONCLUÍDO"}
                                </button>
                                <button className="action-button danger" type="button" onClick={() => onDelete(task)}>
                                    Excluir
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
            <p className={`empty-state ${tasks.length ? "hidden" : ""}`} id="taskEmptyState">
                Nenhuma tarefa cadastrada.
            </p>
        </>
    );
}
