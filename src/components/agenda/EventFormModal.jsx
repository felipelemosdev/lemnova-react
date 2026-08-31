// src/components/agenda/EventFormModal.jsx
// Migrado de: <div id="eventFormOverlay"> em index.html + handleEventSubmit(),
// openEventFormModal(), closeEventFormModal(), resetEventForm(), fillEventForm() de
// js/agenda.js.

import { useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { eventsApi } from "../../services/api.js";
import { todayISO } from "../../services/utils.js";

const EVENT_TYPES = ["Avaliação social", "Perícia médica", "Perícia judicial", "Reunião", "Agendamento", "Outros"];
const ALERT_OPTIONS = ["No horário", "1 dia antes", "3 dias antes", "7 dias antes"];
// Status específico de avaliação social / perícia médica, além do "concluído" (done) que
// os outros tipos de evento já usam — pedido explícito do fluxo do processo (2.1/2.2).
const EXAM_STATUS_OPTIONS = ["Agendada", "Realizada", "Cancelada", "Reagendada"];
const EXAM_TYPES = ["Avaliação social", "Perícia médica"];

function emptyForm() {
    return {
        type: EVENT_TYPES[0],
        date: todayISO(),
        time: "09:00",
        location: "",
        examStatus: EXAM_STATUS_OPTIONS[0],
        clientId: "",
        alert: "No horário",
        notes: ""
    };
}

export default function EventFormModal({ editingEvent, onClose }) {
    const { clients, refresh } = useApp();
    const [form, setForm] = useState(() => (editingEvent ? eventToForm(editingEvent) : emptyForm()));
    const typeInputRef = useRef(null);

    useEffect(() => {
        typeInputRef.current?.focus();
    }, []);

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const isExam = EXAM_TYPES.includes(form.type);
        const payload = {
            type: form.type,
            date: form.date,
            time: form.time,
            location: form.location.trim(),
            // examStatus só faz sentido pra Avaliação social/Perícia médica; outros tipos
            // continuam usando só o "done" (concluído) que já existia.
            examStatus: isExam ? form.examStatus : "",
            clientId: form.clientId,
            alert: form.alert,
            notes: form.notes.trim()
        };

        if (editingEvent) {
            await eventsApi.update(editingEvent.id, payload);
        } else {
            await eventsApi.create({ ...payload, done: false });
        }

        await refresh();
        onClose();
    }

    return (
        <div id="eventFormOverlay" className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="agendaFormTitle">
            <div className="modal-panel event-form-modal">
                <div className="event-form-header">
                    <div>
                        <p className="eyebrow">Agenda</p>
                        <h3 id="agendaFormTitle">{editingEvent ? "Editar evento" : "Novo evento"}</h3>
                    </div>
                    <button id="closeEventFormButton" className="modal-close" type="button" aria-label="Fechar" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form id="eventForm" className="form-grid" onSubmit={handleSubmit}>
                    <label className="field">
                        <span>Tipo de evento</span>
                        <select ref={typeInputRef} id="eventType" required value={form.type} onChange={(e) => updateField("type", e.target.value)}>
                            {EVENT_TYPES.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </label>

                    <label className="field">
                        <span>Data</span>
                        <input id="eventDate" type="date" required value={form.date} onChange={(e) => updateField("date", e.target.value)} />
                    </label>

                    <label className="field">
                        <span>Horário</span>
                        <input id="eventTime" type="time" required value={form.time} onChange={(e) => updateField("time", e.target.value)} />
                    </label>

                    <label className="field">
                        <span>Cliente</span>
                        <select id="eventClient" value={form.clientId} onChange={(e) => updateField("clientId", e.target.value)}>
                            <option value="">Sem cliente vinculado</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </label>

                    {EXAM_TYPES.includes(form.type) ? (
                        <>
                            <label className="field">
                                <span>Local</span>
                                <input
                                    id="eventLocation"
                                    type="text"
                                    placeholder="Ex: Agência do INSS - Centro"
                                    value={form.location}
                                    onChange={(e) => updateField("location", e.target.value)}
                                />
                            </label>

                            <label className="field">
                                <span>Status</span>
                                <select
                                    id="eventExamStatus"
                                    value={form.examStatus}
                                    onChange={(e) => updateField("examStatus", e.target.value)}
                                >
                                    {EXAM_STATUS_OPTIONS.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </label>
                        </>
                    ) : null}

                    <label className="field">
                        <span>Alerta</span>
                        <select id="eventAlert" required value={form.alert} onChange={(e) => updateField("alert", e.target.value)}>
                            {ALERT_OPTIONS.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </label>

                    <label className="field full-width">
                        <span>Obs. curta</span>
                        <input
                            id="eventNotes"
                            type="text"
                            maxLength={90}
                            placeholder="Resumo curto para aparecer na agenda"
                            value={form.notes}
                            onChange={(e) => updateField("notes", e.target.value)}
                        />
                    </label>

                    <div className="form-actions full-width">
                        {editingEvent ? (
                            <button id="cancelEventEdit" className="btn btn-ghost" type="button" onClick={onClose}>
                                Cancelar edição
                            </button>
                        ) : null}
                        <button id="saveEventButton" className="btn btn-primary" type="submit">
                            {editingEvent ? "Alterar evento" : "Salvar evento"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function eventToForm(eventItem) {
    return {
        type: eventItem.type || "Avaliação social",
        date: eventItem.date || todayISO(),
        time: eventItem.time || "09:00",
        location: eventItem.location || "",
        examStatus: eventItem.examStatus || EXAM_STATUS_OPTIONS[0],
        clientId: eventItem.clientId || "",
        alert: eventItem.alert || "No horário",
        notes: eventItem.notes || ""
    };
}
