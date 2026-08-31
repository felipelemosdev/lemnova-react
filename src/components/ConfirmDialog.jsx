// src/components/ConfirmDialog.jsx
// Migrado de: <div id="confirmOverlay"> em index.html — modal genérico de confirmação
// de exclusão, usado no app original por clientes, lançamentos financeiros e parcelas.
//
// Em vez de um único modal global controlado por várias variáveis (pendingDeleteClientId,
// pendingDeleteFinanceId, pendingDeleteInstallmentId...) como no app original, aqui cada
// tela que precisa confirmar uma exclusão guarda seu próprio estado e usa este mesmo
// componente — mais fácil de acompanhar o fluxo de dados em React.

export default function ConfirmDialog({ open, title, text, confirmLabel = "Excluir", onConfirm, onCancel }) {
    if (!open) return null;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
            <div className="modal-panel">
                <div>
                    <p className="eyebrow">Confirmação</p>
                    <h3 id="confirmTitle">{title}</h3>
                    <p>{text}</p>
                </div>
                <div className="modal-actions">
                    <button className="btn btn-ghost" type="button" onClick={onCancel}>
                        Cancelar
                    </button>
                    <button className="btn btn-danger" type="button" onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
