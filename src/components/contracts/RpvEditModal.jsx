// src/components/contracts/RpvEditModal.jsx
// ADAPTAÇÃO CONSCIENTE em relação ao app original:
// No app original, o botão "Editar" da tabela de RPV levava o usuário até a tela de
// Clientes, abrindo o cadastro completo do cliente em modo de edição (o RPV é só mais um
// campo daquele formulário gigante). Fazer isso em React exigiria acoplar duas páginas
// independentes (Contratos precisando controlar o estado interno de Clientes só pra abrir
// um formulário) — o que vai contra a organização modular que você pediu lá no início.
//
// Por isso criei este modal pequeno, só com os 2 campos de RPV (valor e data prevista),
// que edita o mesmo cliente sem sair da tela de Contratos. O valor final pro usuário é o
// mesmo (consegue editar o RPV), só o caminho até lá que mudou.

import { useState } from "react";
import { clientsApi } from "../../services/api.js";
import { ADMINISTRATIVE_STATUS_OPTIONS } from "../../services/domain.js";

export default function RpvEditModal({ client, onClose, onSaved }) {
    const [rpvValue, setRpvValue] = useState(client.rpvValue ?? "");
    const [rpvDate, setRpvDate] = useState(client.rpvDate || "");
    const [administrativeStatus, setAdministrativeStatus] = useState(client.administrativeStatus || "Em andamento");

    async function handleSubmit(event) {
        event.preventDefault();
        await clientsApi.update(client.id, { rpvValue: Number(rpvValue) || 0, rpvDate, administrativeStatus });
        await onSaved();
        onClose();
    }

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="rpvModalTitle">
            <div className="modal-panel">
                <h3 id="rpvModalTitle">Editar RPV — {client.name}</h3>
                <form onSubmit={handleSubmit}>
                    <label className="field" style={{ marginTop: 12 }}>
                        <span>Status do administrativo</span>
                        <select value={administrativeStatus} onChange={(e) => setAdministrativeStatus(e.target.value)}>
                            {ADMINISTRATIVE_STATUS_OPTIONS.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </label>
                    <p className="field-hint">
                        O RPV só entra em vigor (vira conta a receber de verdade) quando o administrativo estiver{" "}
                        <strong>Indeferido</strong>.
                    </p>

                    <label className="field" style={{ marginTop: 12 }}>
                        <span>Valor previsto (R$)</span>
                        <input type="number" min="0" step="0.01" required value={rpvValue} onChange={(e) => setRpvValue(e.target.value)} />
                    </label>

                    <label className="field" style={{ marginTop: 12 }}>
                        <span>Data prevista</span>
                        <input type="date" value={rpvDate} onChange={(e) => setRpvDate(e.target.value)} />
                    </label>

                    <div className="modal-actions" style={{ marginTop: 16 }}>
                        <button className="btn btn-ghost" type="button" onClick={onClose}>
                            Cancelar
                        </button>
                        <button className="btn btn-primary" type="submit">
                            Salvar RPV
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
