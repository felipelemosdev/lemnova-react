// src/pages/Processos.jsx
// Migrado de: <section id="documentsSection"> em index.html + o "roteador" de ações
// de handleDocumentListClick/requestDocumentDelete/confirmDocumentDelete de
// js/documents.js.

import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { documentsApi } from "../services/api.js";
import DocumentForm from "../components/documents/DocumentForm.jsx";
import DocumentList from "../components/documents/DocumentList.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import DocumentPreviewModal from "../components/DocumentPreviewModal.jsx";
import { formatFileSize, getDocumentLabel } from "../services/utils.js";

export default function Processos() {
    const { documents, findClient, refresh } = useApp();
    const [pendingDelete, setPendingDelete] = useState(null);
    const [preview, setPreview] = useState(null);

    function openPreview(documentItem) {
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

    async function confirmDelete() {
        await documentsApi.remove(pendingDelete.id);
        await refresh();
        setPendingDelete(null);
    }

    return (
        <section id="documentsSection" className="content-section active-section">
            <div className="workspace-grid">
                <DocumentForm />
                <DocumentList
                    documents={documents}
                    findClient={findClient}
                    onPreview={openPreview}
                    onDelete={(documentItem) => setPendingDelete(documentItem)}
                />
            </div>

            <ConfirmDialog
                open={Boolean(pendingDelete)}
                title="Excluir processo"
                text="Esta ação removerá o processo e o arquivo anexado a ele."
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
