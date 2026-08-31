// src/components/agenda/EventList.jsx
// Migrado de: <div id="eventBoard"> em index.html + renderEvents(), renderEventCategory(),
// createEventCard(), createEventListItem(), setEventViewMode(), getCurrentMonthEndISO()
// de js/agenda.js.

import { formatDate, todayISO } from "../../services/utils.js";

function getCurrentMonthEndISO() {
    const [year, month] = todayISO().split("-").map(Number);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

export default function EventList({ events, viewMode, findClient, onEdit, onDelete, onComplete }) {
    const today = todayISO();
    const monthEnd = getCurrentMonthEndISO();

    const groups = {
        overdue: events.filter((eventItem) => eventItem.date < today),
        today: events.filter((eventItem) => eventItem.date === today),
        // "Restante do mês": depois de hoje, até o último dia do mês corrente.
        // Eventos além do mês atual não aparecem em nenhuma das 3 categorias
        // (mesmo comportamento do app original).
        month: events.filter((eventItem) => eventItem.date > today && eventItem.date <= monthEnd)
    };

    return (
        <div id="eventBoard" className="agenda-board">
            <EventCategory
                title="Atrasados"
                events={groups.overdue}
                viewMode={viewMode}
                findClient={findClient}
                onEdit={onEdit}
                onDelete={onDelete}
                onComplete={onComplete}
                emptyMessage="Nenhum evento atrasado."
                className="agenda-category-overdue"
            />
            <EventCategory
                title="Hoje"
                events={groups.today}
                viewMode={viewMode}
                findClient={findClient}
                onEdit={onEdit}
                onDelete={onDelete}
                onComplete={onComplete}
                emptyMessage="Nenhum evento para hoje."
                className="agenda-category-today"
            />
            <EventCategory
                title="Restante do mês"
                events={groups.month}
                viewMode={viewMode}
                findClient={findClient}
                onEdit={onEdit}
                onDelete={onDelete}
                onComplete={onComplete}
                emptyMessage="Nenhum outro evento este mês."
                className="agenda-category-month"
            />
        </div>
    );
}

function EventCategory({ title, events, viewMode, findClient, onEdit, onDelete, onComplete, emptyMessage, className }) {
    return (
        <div className={`agenda-category ${className}`}>
            <div className="agenda-category-header">
                <span>{title}</span>
                <span className="agenda-category-count">{events.length}</span>
            </div>
            <div className="agenda-category-body">
                {events.length === 0 ? (
                    <p className="agenda-category-empty">{emptyMessage}</p>
                ) : viewMode === "cards" ? (
                    events.map((eventItem) => (
                        <EventCard key={eventItem.id} eventItem={eventItem} findClient={findClient} onEdit={onEdit} onDelete={onDelete} onComplete={onComplete} />
                    ))
                ) : (
                    events.map((eventItem) => (
                        <EventListItem key={eventItem.id} eventItem={eventItem} findClient={findClient} onEdit={onEdit} onDelete={onDelete} onComplete={onComplete} />
                    ))
                )}
            </div>
        </div>
    );
}

function EventListItem({ eventItem, findClient, onEdit, onDelete, onComplete }) {
    const client = findClient(eventItem.clientId);
    return (
        <article className="compact-item event-item">
            <div>
                <strong>{eventItem.type}</strong>
                <span>{formatDate(eventItem.date)} às {eventItem.time}</span>
                <span>Cliente: {client ? client.name : "Sem cliente vinculado"}</span>
                {eventItem.location ? <span>Local: {eventItem.location}</span> : null}
                {eventItem.notes ? <small>Obs: {eventItem.notes}</small> : null}
            </div>
            <div className="event-actions">
                {eventItem.examStatus ? <span className="status-pill">{eventItem.examStatus}</span> : null}
                <span className="status-pill">{eventItem.alert}</span>
                <button className="action-button complete" type="button" onClick={() => onComplete(eventItem.id)}>
                    ✓ CONCLUÍDO
                </button>
                <button className="action-button" type="button" onClick={() => onEdit(eventItem)}>
                    Editar
                </button>
                <button className="action-button danger" type="button" onClick={() => onDelete(eventItem)}>
                    Excluir
                </button>
            </div>
        </article>
    );
}

function EventCard({ eventItem, findClient, onEdit, onDelete, onComplete }) {
    const client = findClient(eventItem.clientId);
    return (
        <article className="agenda-event-card">
            <strong>{eventItem.type}</strong>
            <span className="agenda-event-client">Cliente: {client ? client.name : "Sem cliente vinculado"}</span>
            {eventItem.location ? <span className="agenda-event-notes">Local: {eventItem.location}</span> : null}
            {eventItem.notes ? <span className="agenda-event-notes">{eventItem.notes}</span> : null}
            <div className="agenda-event-card-meta">
                {eventItem.examStatus ? <span className="status-pill">{eventItem.examStatus}</span> : null}
                <span className="status-pill">{eventItem.alert}</span>
                <span className="agenda-event-card-date">{formatDate(eventItem.date)} às {eventItem.time}</span>
            </div>
            <div className="agenda-event-card-actions">
                <button className="action-button complete" type="button" onClick={() => onComplete(eventItem.id)}>
                    ✓ Concluído
                </button>
                <button className="action-button" type="button" onClick={() => onEdit(eventItem)}>
                    Editar
                </button>
                <button className="action-button danger" type="button" onClick={() => onDelete(eventItem)}>
                    Excluir
                </button>
            </div>
        </article>
    );
}
