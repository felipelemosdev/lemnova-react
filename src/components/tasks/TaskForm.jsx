// src/components/tasks/TaskForm.jsx
// Migrado de: <form id="taskForm"> em index.html + handleTaskSubmit() de js/tasks.js.

import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { tasksApi } from "../../services/api.js";

function emptyForm() {
    return { title: "", from: "", responsible: "", priority: "medium", dueDate: "", clientId: "", alert: "no_dia", description: "" };
}

export default function TaskForm() {
    const { clients, refresh } = useApp();
    const [form, setForm] = useState(emptyForm);

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        await tasksApi.create({
            title: form.title.trim(),
            from: form.from.trim(),
            responsible: form.responsible.trim(),
            priority: form.priority,
            dueDate: form.dueDate,
            clientId: form.clientId,
            alert: form.alert,
            description: form.description.trim(),
            done: false,
            replies: [],
            unreadCount: 0
        });

        await refresh();
        setForm(emptyForm());
    }

    return (
        <form id="taskForm" className="workspace-panel form-grid" onSubmit={handleSubmit}>
            <div className="section-heading full-width">
                <div>
                    <p className="eyebrow">Tarefas</p>
                    <h3>Nova tarefa</h3>
                </div>
            </div>

            <label className="field">
                <span>Título</span>
                <input
                    id="taskTitle"
                    type="text"
                    placeholder="Ex.: Protocolar petição"
                    required
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                />
            </label>

            <label className="field">
                <span>De (quem está enviando/solicitando)</span>
                <input
                    id="taskFrom"
                    type="text"
                    placeholder="Nome de quem está atribuindo a tarefa"
                    value={form.from}
                    onChange={(e) => updateField("from", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Para (responsável pela tarefa)</span>
                <input
                    id="taskResponsible"
                    type="text"
                    placeholder="Nome do responsável"
                    value={form.responsible}
                    onChange={(e) => updateField("responsible", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Prioridade</span>
                <select id="taskPriority" required value={form.priority} onChange={(e) => updateField("priority", e.target.value)}>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                </select>
            </label>

            <label className="field">
                <span>Prazo</span>
                <input id="taskDueDate" type="date" value={form.dueDate} onChange={(e) => updateField("dueDate", e.target.value)} />
            </label>

            <label className="field">
                <span>Cliente relacionado</span>
                <select id="taskClient" value={form.clientId} onChange={(e) => updateField("clientId", e.target.value)}>
                    <option value="">Sem cliente vinculado</option>
                    {clients.map((client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span>Alerta</span>
                <select id="taskAlert" value={form.alert} onChange={(e) => updateField("alert", e.target.value)}>
                    <option value="no_dia">No dia do prazo</option>
                    <option value="1_dia">1 dia antes</option>
                    <option value="3_dias">3 dias antes</option>
                    <option value="7_dias">7 dias antes</option>
                    <option value="sem_alerta">Sem alerta</option>
                </select>
            </label>

            <label className="field full-width">
                <span>Descrição</span>
                <textarea
                    id="taskDescription"
                    rows={3}
                    placeholder="Detalhes da tarefa"
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                />
            </label>

            <button className="btn btn-primary full-width" type="submit">
                Adicionar tarefa
            </button>
        </form>
    );
}
