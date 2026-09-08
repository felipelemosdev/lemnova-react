// src/components/contracts/ContractPrintModal.jsx
// Novo nesta fase: modal que escolhe o tipo de contrato e manda pra impressão, usando o
// timbre e o texto exatos de src/contracts/. Aberto pelo botão "🖨 Contrato" da lista de
// clientes (ver ClientListPanel.jsx) — ficou como placeholder desde a Fase 3, agora
// funciona de verdade.
//
// Só tipos com texto já cadastrado (ver src/contracts/registry.js) aparecem na lista.
// Os demais benefícios do cadastro do cliente (Pensão por Morte, Majoração, Consumidor)
// ainda não têm contrato digitado — entram assim que o texto chegar.

import { useState } from "react";
import { CONTRACT_TEMPLATES, suggestContractTemplateId } from "../../contracts/registry.js";
import { openContractPrintWindow } from "../../contracts/shared.js";

export default function ContractPrintModal({ client, onClose }) {
    const [templateId, setTemplateId] = useState(() => suggestContractTemplateId(client));

    function handlePrint() {
        const template = CONTRACT_TEMPLATES[templateId];
        if (!template) return;
        const bodyHtml = template.buildBody(client);
        openContractPrintWindow(template.title, client, bodyHtml);
        onClose();
    }

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="contractModalTitle">
            <div className="modal-panel">
                <h3 id="contractModalTitle">Gerar contrato — {client.name}</h3>

                <label className="field" style={{ marginTop: 12 }}>
                    <span>Tipo de contrato</span>
                    <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                        {Object.values(CONTRACT_TEMPLATES).map((template) => (
                            <option key={template.id} value={template.id}>{template.label}</option>
                        ))}
                    </select>
                </label>

                <p className="field-hint">
                    Confere se o cadastro do cliente está completo (nome, nacionalidade, estado civil, profissão, RG,
                    CPF e endereço) antes de gerar — o que estiver em branco no cadastro sai como linha em branco no
                    contrato, pra preencher à mão.
                </p>

                <div className="modal-actions" style={{ marginTop: 16 }}>
                    <button className="btn btn-ghost" type="button" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="btn btn-primary" type="button" onClick={handlePrint}>
                        🖨 Gerar e imprimir
                    </button>
                </div>
            </div>
        </div>
    );
}
