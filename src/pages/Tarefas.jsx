// src/pages/Tarefas.jsx
// Migrado de: <section id="tasksSection"> em index.html.
//
// O modal de conversa (chat) não vive aqui: fica em components/TaskReplyModal.jsx,
// montado uma vez no Layout, porque o botão 💬 do topbar (em qualquer tela do sistema)
// também precisa conseguir abri-lo.

import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { printTasksReport } from "../services/print.js";
import TaskForm from "../components/tasks/TaskForm.jsx";
import TaskList from "../components/tasks/TaskList.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function Tarefas() {
    const { tasks, findClient, deleteTask } = useApp();
    const [pendingDelete, setPendingDelete] = useState(null);

    async function confirmDelete() {
        await deleteTask(pendingDelete.id);
        setPendingDelete(null);
    }

    return (
        <section id="tasksSection" className="content-section active-section">
            <div className="workspace-grid">
                <TaskForm />

                <section id="taskListPanel" className="workspace-panel">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">Gestão</p>
                            <h3>Tarefas cadastradas</h3>
                        </div>
                        <button
                            id="printTasksReportButton"
                            className="btn btn-ghost btn-print"
                            type="button"
                            onClick={() => printTasksReport(tasks, findClient)}
                        >
                            🖨 Relatório por status
                        </button>
                    </div>
                    <TaskList onDelete={(task) => setPendingDelete(task)} />
                </section>
            </div>

            <ConfirmDialog
                open={Boolean(pendingDelete)}
                title="Excluir tarefa"
                text={pendingDelete ? `Deseja excluir a tarefa "${pendingDelete.title}"?` : ""}
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />
        </section>
    );
}
