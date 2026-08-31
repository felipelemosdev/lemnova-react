// src/components/clients/ClientListPanel.jsx
// Migrado de: <section id="registeredClientsPanel"> em index.html + renderClients(),
// renderClientsAsCards(), renderClientsAsList(), setClientViewMode(), createClientActions(),
// createClientListActions(), createClientAvatar() de js/clients.js.

import { useState, Fragment } from "react";
import { sortClients, PROCESS_STAGES } from "../../services/domain.js";
import { getInitials, formatCpf } from "../../services/utils.js";
import ClientExpandedDetails from "./ClientExpandedDetails.jsx";

const BENEFIT_FILTER_OPTIONS = [
    "Aposentadoria", "Auxílio-Doença", "Auxílio-Acidente", "Doença Ocupacional",
    "Pensão por Morte", "Trabalhista", "Maternidade", "Majoração", "LOAS Idoso",
    "LOAS Deficiente", "Consumidor"
];

const SORT_OPTIONS = [
    { value: "name-asc", label: "Nome (A → Z)" },
    { value: "name-desc", label: "Nome (Z → A)" },
    { value: "recent", label: "Mais recentes" },
    { value: "oldest", label: "Mais antigos" },
    { value: "status", label: "Status" }
];

export default function ClientListPanel({ clients, documents, onEdit, onDelete, onPreviewDocument, onPreviewClientPdf, onPrintContract }) {
    const [viewMode, setViewMode] = useState("cards");
    const [search, setSearch] = useState("");
    const [benefitFilter, setBenefitFilter] = useState("");
    const [stageFilter, setStageFilter] = useState("");
    const [sortOrder, setSortOrder] = useState("name-asc");
    const [openClientId, setOpenClientId] = useState(null);

    const searchTerm = search.trim().toLowerCase();
    const filteredClients = sortClients(
        clients.filter((client) => {
            if (benefitFilter && client.benefit !== benefitFilter) {
                return false;
            }
            if (stageFilter && (client.processStage || PROCESS_STAGES[0]) !== stageFilter) {
                return false;
            }
            const content = `${client.name} ${client.document} ${client.phone} ${client.benefit || ""}`.toLowerCase();
            return content.includes(searchTerm);
        }),
        sortOrder
    );

    function toggleOpen(clientId) {
        setOpenClientId((current) => (current === clientId ? null : clientId));
    }

    return (
        <section id="registeredClientsPanel" className="workspace-panel registered-clients-panel">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">Clientes já cadastrados</p>
                    <h3>Lista de clientes</h3>
                </div>
                <div className="view-toggle" role="group" aria-label="Modo de visualização">
                    <button
                        id="clientViewCards"
                        className={`btn-ghost view-toggle-button ${viewMode === "cards" ? "active" : ""}`}
                        type="button"
                        onClick={() => setViewMode("cards")}
                    >
                        ▦ Cards
                    </button>
                    <button
                        id="clientViewList"
                        className={`btn-ghost view-toggle-button ${viewMode === "list" ? "active" : ""}`}
                        type="button"
                        onClick={() => setViewMode("list")}
                    >
                        ☰ Lista
                    </button>
                </div>
            </div>

            <div className="list-controls">
                <label className="search-field list-controls-search">
                    <span className="sr-only">Pesquisar clientes</span>
                    <input
                        id="clientSearch"
                        type="search"
                        placeholder="Pesquisar por nome, CPF ou telefone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </label>

                <label className="field list-controls-sort">
                    <span>Filtrar por tipo de contrato</span>
                    <select id="clientBenefitFilter" value={benefitFilter} onChange={(e) => setBenefitFilter(e.target.value)}>
                        <option value="">Todos os tipos</option>
                        {BENEFIT_FILTER_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </label>

                <label className="field list-controls-sort">
                    <span>Filtrar por etapa do processo</span>
                    <select id="clientStageFilter" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
                        <option value="">Todas as etapas</option>
                        {PROCESS_STAGES.map((stage) => (
                            <option key={stage} value={stage}>{stage}</option>
                        ))}
                    </select>
                </label>

                <label className="field list-controls-sort">
                    <span>Ordenar / imprimir por</span>
                    <select id="clientSortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </label>
            </div>

            {viewMode === "list" ? (
                <ClientListTable
                    clients={filteredClients}
                    documents={documents}
                    openClientId={openClientId}
                    onToggle={toggleOpen}
                    onPreviewDocument={onPreviewDocument}
                    onPreviewClientPdf={onPreviewClientPdf}
                />
            ) : (
                <div id="clientTableBody" className="client-profile-list">
                    {filteredClients.map((client) => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            documents={documents}
                            isOpen={openClientId === client.id}
                            onToggle={() => toggleOpen(client.id)}
                            onEdit={() => onEdit(client)}
                            onDelete={() => onDelete(client)}
                            onPrintContract={() => onPrintContract(client)}
                            onPreviewDocument={onPreviewDocument}
                            onPreviewClientPdf={onPreviewClientPdf}
                        />
                    ))}
                </div>
            )}

            <p id="clientEmptyState" className={`empty-state ${filteredClients.length ? "hidden" : ""}`}>
                Nenhum cliente encontrado.
            </p>
        </section>
    );
}

function ClientAvatar({ client }) {
    if (client.photoData) {
        return <img className="client-avatar large" src={client.photoData} alt={`Foto 3x4 de ${client.name}`} />;
    }
    return <span className="client-avatar large" aria-hidden="true">{getInitials(client.name)}</span>;
}

function ClientCard({ client, documents, isOpen, onToggle, onEdit, onDelete, onPrintContract, onPreviewDocument, onPreviewClientPdf }) {
    return (
        <article className="client-profile-card" data-client-id={client.id}>
            <div className="client-profile-header" onClick={onToggle}>
                <ClientAvatar client={client} />
                <div className="client-profile-title">
                    <strong>{client.name}</strong>
                    <span>CPF {formatCpf(client.document)} · {client.status || "Sem status"}</span>
                    <span className="task-pill medium">{client.processStage || PROCESS_STAGES[0]}</span>
                </div>
                <div className="table-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="action-button" type="button" onClick={onToggle}>{isOpen ? "Fechar" : "Abrir"}</button>
                    <button className="action-button" type="button" onClick={onPrintContract}>🖨 Contrato</button>
                    <button className="action-button" type="button" onClick={onEdit}>Editar</button>
                    <button className="action-button danger" type="button" onClick={onDelete}>Excluir</button>
                </div>
            </div>

            <div className={`client-expanded ${isOpen ? "" : "hidden"}`}>
                {isOpen ? (
                    <ClientExpandedDetails
                        client={client}
                        documents={documents}
                        onPreviewDocument={onPreviewDocument}
                        onPreviewClientPdf={onPreviewClientPdf}
                    />
                ) : null}
            </div>
        </article>
    );
}

function ClientListTable({ clients, documents, openClientId, onToggle, onPreviewDocument, onPreviewClientPdf }) {
    if (!clients.length) {
        return null;
    }

    return (
        <div className="table-wrap">
            <table>
                <thead>
                    <tr><th>Cliente</th><th>Telefone</th><th>Ações</th></tr>
                </thead>
                <tbody>
                    {clients.map((client) => {
                        const isOpen = openClientId === client.id;
                        return (
                            <Fragment key={client.id}>
                                <tr className="client-row" data-client-id={client.id}>
                                    <td>
                                        <div className="client-cell">
                                            <div>
                                                <strong>{client.name}</strong>
                                                <span>CPF {formatCpf(client.document)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{client.phone || "Não informado"}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="action-button" type="button" onClick={() => onToggle(client.id)}>
                                                {isOpen ? "Fechar" : "Abrir"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {isOpen ? (
                                    <tr className="client-row-detail">
                                        <td colSpan={3}>
                                            <div className="client-expanded">
                                                <ClientExpandedDetails
                                                    client={client}
                                                    documents={documents}
                                                    onPreviewDocument={onPreviewDocument}
                                                    onPreviewClientPdf={onPreviewClientPdf}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ) : null}
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
