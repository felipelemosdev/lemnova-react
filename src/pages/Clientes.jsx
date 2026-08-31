// src/pages/Clientes.jsx
// Migrado de: <section id="clientsSection"> em index.html + o "roteador" de ações
// handleClientTableClick/showClientMode de js/clients.js.
//
// Orquestra o cadastro (ClientForm) e a listagem (ClientListPanel), além dos dois
// modais compartilhados (confirmação de exclusão e visualização de PDF/documento).
//
// "Imprimir contrato" ainda não está disponível: no app original abria o modal de
// contrato (js/contract.js), que é conteúdo de uma fase futura da migração.

import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import ClientForm from "../components/clients/ClientForm.jsx";
import ClientListPanel from "../components/clients/ClientListPanel.jsx";
import ProcessStageTracker from "../components/clients/ProcessStageTracker.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import DocumentPreviewModal from "../components/DocumentPreviewModal.jsx";
import { formatFileSize, getDocumentLabel } from "../services/utils.js";

export default function Clientes() {
    const { clients, documents, findClient, deleteClient } = useApp();
    const [mode, setMode] = useState("register");
    const [editingClientId, setEditingClientId] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [preview, setPreview] = useState(null);

    // Deriva sempre da lista atual do contexto (em vez de guardar uma cópia do cliente em
    // state) — assim, depois de changeStage() no ProcessStageTracker (que dá refresh()),
    // o tracker e o formulário recebem a etapa/campos atualizados sem precisar sincronizar
    // manualmente duas fontes de verdade.
    const editingClient = editingClientId ? clients.find((client) => client.id === editingClientId) || null : null;

    function startEdit(client) {
        setEditingClientId(client.id);
        setMode("register");
    }

    function startCreate() {
        setEditingClientId(null);
        setMode("register");
    }

    function handleSaved() {
        setEditingClientId(null);
        setMode("list");
    }

    async function confirmDelete() {
        await deleteClient(pendingDelete.id);
        if (editingClientId === pendingDelete.id) {
            setEditingClientId(null);
        }
        setPendingDelete(null);
    }

    function openClientPdfPreview(client) {
        if (!client.pdfData) {
            alert("PDF indisponível para este cliente.");
            return;
        }
        setPreview({
            title: `Cadastro - ${client.name}`,
            meta: `${client.pdfName || "Arquivo PDF"} · ${formatFileSize(client.pdfSize)}`,
            src: client.pdfData,
            kind: "pdf"
        });
    }

    function openDocumentPreview(documentItem) {
        if (!documentItem.fileData) {
            alert("Prévia indisponível para este processo.");
            return;
        }
        const client = findClient(documentItem.clientId);
        const label = getDocumentLabel(documentItem.fileType);
        setPreview({
            title: `Processo ${documentItem.title}`,
            meta: `${documentItem.processClass || "Classe não informada"} · ${documentItem.processCourt || "Tribunal não informado"} · ${documentItem.fileName} · ${formatFileSize(documentItem.fileSize)} · ${client ? client.name : "Sem cliente"}`,
            src: documentItem.fileData,
            kind: label === "PDF" ? "pdf" : "image"
        });
    }

    function handlePrintContract() {
        alert("Impressão de contrato ainda será migrada na fase de Contratos.");
    }

    return (
        <section id="clientsSection" className="content-section active-section">
            <div className="client-page">
                <div className="client-toolbar">
                    <button
                        id="showClientRegister"
                        className={`btn ${mode === "register" ? "btn-primary" : "btn-ghost"}`}
                        type="button"
                        onClick={startCreate}
                    >
                        Cadastro de cliente
                    </button>
                    <button
                        id="showClientList"
                        className={`btn ${mode === "list" ? "btn-primary" : "btn-ghost"}`}
                        type="button"
                        onClick={() => setMode("list")}
                    >
                        Clientes cadastrados
                    </button>
                </div>

                {mode === "register" && editingClient ? (
                    <ProcessStageTracker client={editingClient} />
                ) : null}

                {mode === "register" ? (
                    <ClientForm
                        key={editingClient?.id ?? "new"}
                        editingClient={editingClient}
                        onCancelEdit={() => {
                            setEditingClientId(null);
                        }}
                        onSaved={handleSaved}
                    />
                ) : (
                    <ClientListPanel
                        clients={clients}
                        documents={documents}
                        onEdit={startEdit}
                        onDelete={(client) => setPendingDelete(client)}
                        onPreviewDocument={openDocumentPreview}
                        onPreviewClientPdf={openClientPdfPreview}
                        onPrintContract={handlePrintContract}
                    />
                )}
            </div>

            <ConfirmDialog
                open={Boolean(pendingDelete)}
                title="Excluir cliente"
                text="Esta ação removerá o cliente da sua base."
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />

            <DocumentPreviewModal
                open={Boolean(preview)}
                title={preview?.title}
                meta={preview?.meta}
                src={preview?.src}
                kind={preview?.kind}
                onClose={() => setPreview(null)}
            />
        </section>
    );
}
