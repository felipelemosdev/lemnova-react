// src/pages/Agenda.jsx
// Migrado de: <section id="agendaSection"> em index.html + o "roteador" de ações de
// handleEventListClick/deleteEvent/completeEvent de js/agenda.js.

import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { eventsApi } from "../services/api.js";
import { getSortedEvents } from "../services/domain.js";
import { formatDate } from "../services/utils.js";
import { printCompletedEventsReport } from "../services/print.js";
import EventFormModal from "../components/agenda/EventFormModal.jsx";
import EventList from "../components/agenda/EventList.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function Agenda() {
    const { events, findClient, refresh } = useApp();
    const [viewMode, setViewMode] = useState("list");
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);

    const searchTerm = search.trim().toLowerCase();
    const filteredEvents = getSortedEvents(events).filter((eventItem) => {
        const client = findClient(eventItem.clientId);
        const content = [
            eventItem.type,
            eventItem.date,
            eventItem.time,
            eventItem.alert,
            eventItem.notes,
            eventItem.createdAt ? formatDate(eventItem.createdAt.slice(0, 10)) : "",
            client ? client.name : ""
        ]
            .join(" ")
            .toLowerCase();
        return content.includes(searchTerm);
    });

    function openNewEvent() {
        setEditingEvent(null);
        setModalOpen(true);
    }

    function openEditEvent(eventItem) {
        setEditingEvent(eventItem);
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditingEvent(null);
    }

    async function handleComplete(eventId) {
        await eventsApi.update(eventId, { done: true, completedAt: new Date().toISOString() });
        await refresh();
    }

    async function confirmDelete() {
        await eventsApi.remove(pendingDelete.id);
        await refresh();
        setPendingDelete(null);
    }

    return (
        <section id="agendaSection" className="content-section active-section">
            <section className="workspace-panel">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">Agenda</p>
                        <h3>Agenda cadastrada</h3>
                    </div>
                    <div className="toolbar-row">
                        <button id="openEventFormButton" className="btn btn-primary" type="button" onClick={openNewEvent}>
                            + Novo evento
                        </button>
                        <div className="view-toggle" role="group" aria-label="Modo de visualização">
                            <button
                                id="eventViewList"
                                className={`btn-ghost view-toggle-button ${viewMode === "list" ? "active" : ""}`}
                                type="button"
                                onClick={() => setViewMode("list")}
                            >
                                ☰ Lista
                            </button>
                            <button
                                id="eventViewCards"
                                className={`btn-ghost view-toggle-button ${viewMode === "cards" ? "active" : ""}`}
                                type="button"
                                onClick={() => setViewMode("cards")}
                            >
                                ▦ Cards
                            </button>
                        </div>
                        <button
                            id="printCompletedEventsButton"
                            className="btn btn-ghost btn-print"
                            type="button"
                            onClick={() => printCompletedEventsReport(events, findClient)}
                        >
                            🖨 Relatório de concluídos
                        </button>
                    </div>
                </div>

                <label className="search-field">
                    <span className="sr-only">Pesquisar eventos</span>
                    <input
                        id="eventSearch"
                        type="search"
                        placeholder="Pesquisar por data, cliente ou tipo"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </label>

                <EventList
                    events={filteredEvents}
                    viewMode={viewMode}
                    findClient={findClient}
                    onEdit={openEditEvent}
                    onDelete={(eventItem) => setPendingDelete(eventItem)}
                    onComplete={handleComplete}
                />
            </section>

            {modalOpen ? (
                <EventFormModal key={editingEvent?.id ?? "new"} editingEvent={editingEvent} onClose={closeModal} />
            ) : null}

            <ConfirmDialog
                open={Boolean(pendingDelete)}
                title="Excluir evento"
                text={pendingDelete ? `Deseja excluir ${pendingDelete.type} de ${formatDate(pendingDelete.date)}?` : ""}
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />
        </section>
    );
}
