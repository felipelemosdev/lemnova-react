// src/components/contracts/KitDocumentsModal.jsx
// Novo nesta fase: modal que lista os documentos do Kit ADM e do Kit Judicial
// disponíveis pro benefício do cliente (campo "Tipo de contrato / serviço" do cadastro),
// cada um com seu próprio botão de imprimir — em vez de escolher "um documento por vez"
// como o ContractPrintModal (que é só pro Contrato de honorários, Kit Financeiro).
//
// Documentos aparecem/somem sozinhos conforme o benefício: por exemplo, Trabalhista e
// Doença Ocupacional não mostram Procuração ADM/Autorização INSS/Termo de Representação
// (não passam pelo INSS) nem a carta RPV (mecanismo exclusivo da Justiça Federal).

import { useState } from "react";
import { getBenefitLabels, BENEFIT_LABELS } from "../../contracts/kits/benefitLabels.js";
import { buildProcuracaoAdm, buildAutorizacaoInss, buildTermoRepresentacao, buildTermoCienciaGolpes } from "../../contracts/kits/adm/index.js";
import {
    buildProcuracaoJudicial,
    buildContratoRpv30,
    buildTermoConcordancia,
    buildDeclaracaoHipossuficiencia,
    buildPatrocinioGratuito,
    buildTermoRenuncia
} from "../../contracts/kits/judicial/index.js";
import { openContractPrintWindow } from "../../contracts/shared.js";

// Mapeia o texto livre do campo "benefit" do cadastro pro id usado em BENEFIT_LABELS —
// mesma lógica de suggestContractTemplateId() em registry.js, só que aqui o usuário
// também pode trocar manualmente (o campo do cadastro nem sempre bate 100% com esses ids).
function guessBenefitId(client) {
    const benefit = (client.benefit || "").toLowerCase();
    const found = Object.entries(BENEFIT_LABELS).find(([, entry]) => benefit.includes(entry.label.toLowerCase()));
    return found ? found[0] : "aposentadoria";
}

export default function KitDocumentsModal({ client, onClose }) {
    const [benefitId, setBenefitId] = useState(() => guessBenefitId(client));
    const benefit = getBenefitLabels(benefitId);

    function print(title, bodyHtml) {
        openContractPrintWindow(title, client, bodyHtml);
    }

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="kitModalTitle">
            <div className="modal-panel">
                <h3 id="kitModalTitle">Documentos ADM/Judicial — {client.name}</h3>

                <label className="field" style={{ marginTop: 12 }}>
                    <span>Benefício</span>
                    <select value={benefitId} onChange={(e) => setBenefitId(e.target.value)}>
                        {Object.entries(BENEFIT_LABELS).map(([id, entry]) => (
                            <option key={id} value={id}>{entry.label}</option>
                        ))}
                    </select>
                </label>

                <p className="field-hint" style={{ marginTop: 8 }}>
                    LOAS Idoso e LOAS Deficiente ainda não estão aqui — têm documentos extras (Termo de
                    Responsabilidade, Anexos, Separação de fato) que entram numa próxima leva.
                </p>

                {benefit.hasAdmKit ? (
                    <>
                        <p className="section-heading" style={{ marginTop: 16, marginBottom: 6 }}>
                            <strong>Kit Administrativo</strong>
                        </p>
                        <div className="table-actions" style={{ flexWrap: "wrap", gap: 8 }}>
                            <button className="action-button" type="button" onClick={() => print("PROCURAÇÃO", buildProcuracaoAdm(client, benefit.admLabel))}>
                                Procuração ADM
                            </button>
                            <button className="action-button" type="button" onClick={() => print("AUTORIZAÇÃO DE ACESSO AO SITE DO “MEU INSS”", buildAutorizacaoInss(client, benefit.admLabel))}>
                                Autorização Meu INSS
                            </button>
                            {benefit.hasTermoRepresentacao !== false ? (
                                <button className="action-button" type="button" onClick={() => print("TERMO DE REPRESENTAÇÃO E AUTORIZAÇÃO DE ACESSO A INFORMAÇÕES PREVIDENCIÁRIAS", buildTermoRepresentacao(client, benefit.admLabel))}>
                                    Termo de Representação
                                </button>
                            ) : null}
                        </div>
                    </>
                ) : (
                    <p className="field-hint" style={{ marginTop: 16 }}>
                        {benefit.label} não passa pelo INSS — sem Kit Administrativo.
                    </p>
                )}

                <p className="section-heading" style={{ marginTop: 20, marginBottom: 6 }}>
                    <strong>Kit Judicial</strong>
                </p>
                <div className="table-actions" style={{ flexWrap: "wrap", gap: 8 }}>
                    {benefit.hasRpvLetter ? (
                        <button className="action-button" type="button" onClick={() => print("CONTRATO DE 30% RPV", buildContratoRpv30(client, benefit.judicialLabel))}>
                            Contrato de 30% RPV
                        </button>
                    ) : null}
                    <button className="action-button" type="button" onClick={() => print("PROCURAÇÃO", buildProcuracaoJudicial(client, benefit.judicialLabel))}>
                        Procuração Judicial
                    </button>
                    <button className="action-button" type="button" onClick={() => print("TERMO DE CONCORDÂNCIA", buildTermoConcordancia(client))}>
                        Termo de Concordância
                    </button>
                    <button className="action-button" type="button" onClick={() => print("DECLARAÇÃO DE HIPOSSUFICIÊNCIA", buildDeclaracaoHipossuficiencia(client, benefit.isTrabalhista))}>
                        Declaração de Hipossuficiência
                    </button>
                    <button className="action-button" type="button" onClick={() => print("DO PATROCÍNIO GRATUITO", buildPatrocinioGratuito(client, benefit.isTrabalhista))}>
                        Patrocínio Gratuito
                    </button>
                    <button className="action-button" type="button" onClick={() => print("TERMO DE RENÚNCIA", buildTermoRenuncia(client))}>
                        Termo de Renúncia
                    </button>
                </div>

                {benefit.hasAdmKit ? (
                    <>
                        <p className="section-heading" style={{ marginTop: 20, marginBottom: 6 }}>
                            <strong>Fixo (sem variação)</strong>
                        </p>
                        <div className="table-actions">
                            <button className="action-button" type="button" onClick={() => print("TERMO DE CIÊNCIA E PREVENÇÃO CONTRA GOLPES", buildTermoCienciaGolpes(client))}>
                                Ciência contra Golpes
                            </button>
                        </div>
                    </>
                ) : null}

                <div className="modal-actions" style={{ marginTop: 20 }}>
                    <button className="btn btn-ghost" type="button" onClick={onClose}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
