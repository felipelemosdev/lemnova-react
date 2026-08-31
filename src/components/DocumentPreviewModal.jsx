// src/components/DocumentPreviewModal.jsx
// Migrado de: <div id="documentPreviewOverlay"> em index.html + openDocumentPreview()/
// openClientPdfPreview() de js/documents.js e js/clients.js.
//
// Reutilizável: qualquer tela que precise mostrar um PDF ou imagem em Data URL (cadastro
// do cliente, processos judiciais, futuramente Kits Jurídicos) usa este mesmo componente.
// `kind` decide se o conteúdo é um <iframe> (PDF) ou uma <img> (JPG/PNG) — mesma
// distinção que o app original fazia (label === "PDF" ? iframe : img).

export default function DocumentPreviewModal({ open, title, meta, src, kind = "pdf", onClose }) {
    if (!open) return null;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="documentPreviewTitle">
            <div className="modal-panel preview-modal">
                <div className="preview-header">
                    <div>
                        <p className="eyebrow">Visualização</p>
                        <h3 id="documentPreviewTitle">{title}</h3>
                        <p>{meta}</p>
                    </div>
                    <button className="icon-button modal-close" type="button" aria-label="Fechar visualização" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className="preview-frame">
                    {kind === "image" ? <img src={src} alt={`Visualização de ${title}`} /> : <iframe src={src} title={title} />}
                </div>
            </div>
        </div>
    );
}
