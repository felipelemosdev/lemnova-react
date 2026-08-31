// src/components/contracts/InstallmentModal.jsx
// Migrado de: <div id="installmentModalOverlay"> em index.html + openInstallmentModal()/
// handleInstallmentModalSave() de js/installments.js.

import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { createManualInstallment, updateInstallmentAmountAndDate } from "../../services/api.js";
import { todayISO } from "../../services/utils.js";

export default function InstallmentModal({ editingInstallment, onClose, onSaved }) {
    const { clients } = useApp();
    const [clientId, setClientId] = useState(editingInstallment?.clientId || "");
    const [amount, setAmount] = useState(editingInstallment?.amount ?? "");
    const [dueDate, setDueDate] = useState(editingInstallment?.dueDate || todayISO());
    const [warning, setWarning] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        if (!editingInstallment && !clientId) {
            setWarning("Selecione o cliente da parcela.");
            return;
        }
        if (!amount || Number(amount) <= 0) {
            setWarning("Informe um valor válido.");
            return;
        }

        if (editingInstallment) {
            await updateInstallmentAmountAndDate(editingInstallment.id, { amount: Number(amount), dueDate });
        } else {
            await createManualInstallment({ clientId, amount: Number(amount), dueDate });
        }

        await onSaved();
        onClose();
    }

    return (
        <div id="installmentModalOverlay" className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="installmentModalTitle">
            <div className="modal-panel">
                <h3 id="installmentModalTitle">{editingInstallment ? "Editar parcela" : "Nova parcela avulsa"}</h3>
                <form id="installmentForm" onSubmit={handleSubmit}>
                    {!editingInstallment ? (
                        <label className="field" id="installmentClientField" style={{ marginTop: 12 }}>
                            <span>Cliente</span>
                            <select id="installmentClient" required value={clientId} onChange={(e) => setClientId(e.target.value)}>
                                <option value="">Selecione</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                        </label>
                    ) : null}

                    <label className="field" style={{ marginTop: 12 }}>
                        <span>Valor (R$)</span>
                        <input
                            id="installmentAmount"
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </label>

                    <label className="field" style={{ marginTop: 12 }}>
                        <span>Vencimento</span>
                        <input id="installmentDueDate" type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </label>

                    {warning ? (
                        <p id="installmentModalWarning" style={{ color: "var(--color-danger)", fontSize: "0.8rem", marginTop: 10 }}>
                            {warning}
                        </p>
                    ) : null}

                    <div className="modal-actions" style={{ marginTop: 16 }}>
                        <button className="btn btn-ghost" type="button" onClick={onClose}>
                            Cancelar
                        </button>
                        <button className="btn btn-primary" type="submit">
                            Salvar parcela
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
