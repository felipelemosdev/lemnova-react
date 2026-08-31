// src/components/documents/DocumentList.jsx
// Migrado de: <section id="documentListPanel"> em index.html + renderDocuments() de
// js/documents.js.

import { getDocumentLabel } from "../../services/utils.js";

export default function DocumentList({ documents, findClient, onPreview, onDelete }) {
    return (
        <section id="documentListPanel" className="workspace-panel">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">Processos judiciais</p>
                    <h3>Listagem</h3>
                </div>
            </div>

            <div id="documentList" className="document-list">
                {documents.map((documentItem) => {
                    const client = findClient(documentItem.clientId);
                    return (
                        <article key={documentItem.id} className="document-item">
                            <div className="document-meta">
                                <strong>{documentItem.title}</strong>
                                <span>
                                    {documentItem.processClass || "Classe não informada"} ·{" "}
                                    {documentItem.processCourt || "Tribunal não informado"} ·{" "}
                                    {client ? client.name : "Sem cliente"}
                                </span>
                                <small>{documentItem.processMovement || "Sem movimentação cadastrada"}</small>
                            </div>
                            <div className="document-actions">
                                <span className="status-pill">{documentItem.processPhase || "Cadastrado"}</span>
                                <span className="document-badge">{getDocumentLabel(documentItem.fileType)}</span>
                                {documentItem.fileData ? (
                                    <button
                                        className="action-button"
                                        type="button"
                                        onClick={() => onPreview(documentItem)}
                                    >
                                        Visualizar
                                    </button>
                                ) : (
                                    <span className="empty-state">Prévia indisponível</span>
                                )}
                                <button className="action-button danger" type="button" onClick={() => onDelete(documentItem)}>
                                    Excluir
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            <p id="documentEmptyState" className={`empty-state ${documents.length ? "hidden" : ""}`}>
                Nenhum processo judicial cadastrado.
            </p>
        </section>
    );
}
