// src/components/clients/ProcessStageTracker.jsx
//
// Linha do tempo do fluxo do processo (Cadastro → ... → Finalizado), migrada do
// documento "Atualização do Fluxo de Cliente e Contrato — Lemnova".
//
// Só aparece na edição de um cliente já existente (um cliente novo nasce direto em
// "Cadastro" — ver ClientForm.jsx). Toda mudança de etapa passa por `changeStage()` do
// AppContext, que grava o histórico em stageHistory (nunca altera processStage direto).
//
// A partir de "Aguardando resultado" o fluxo se bifurca: em vez de um botão "Avançar"
// único, mostramos dois botões (Deferido / Indeferido) — ver STAGE_BRANCH_POINT em
// services/domain.js.

import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { PROCESS_STAGES, STAGE_BRANCH_POINT, getNextLinearStage, getProcessStageIndex } from "../../services/domain.js";
import { formatDate } from "../../services/utils.js";

export default function ProcessStageTracker({ client }) {
    const { changeStage, getClientStageHistory } = useApp();
    const [showHistory, setShowHistory] = useState(false);
    const [protocolDraft, setProtocolDraft] = useState({ date: "", number: "" });

    const currentStage = client.processStage || PROCESS_STAGES[0];
    const currentIndex = getProcessStageIndex(currentStage);
    const history = getClientStageHistory(client.id);
    const isAtProtocolStep = currentStage === "Documentação completa";
    const isAtBranchPoint = currentStage === STAGE_BRANCH_POINT;

    async function advance() {
        if (isAtProtocolStep) {
            // Entrando em "Protocolo realizado": grava data/número junto, numa única
            // mudança de etapa. Se protocolDate já existir (edição posterior), o
            // changeClientProcessStage ignora o novo valor e preserva o original.
            await changeStage(client.id, "Protocolo realizado", {
                protocolDate: protocolDraft.date || client.protocolDate,
                protocolNumber: protocolDraft.number || client.protocolNumber
            });
            return;
        }
        const next = getNextLinearStage(currentStage);
        if (next) await changeStage(client.id, next);
    }

    async function goToResult(result) {
        await changeStage(client.id, result);
    }

    async function goBack() {
        const previous = PROCESS_STAGES[currentIndex - 1];
        if (previous) await changeStage(client.id, previous);
    }

    return (
        <section className="workspace-panel">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">Fluxo do processo</p>
                    <h3>{currentStage}</h3>
                </div>
                <button className="btn btn-ghost" type="button" onClick={() => setShowHistory((v) => !v)}>
                    {showHistory ? "Ocultar histórico" : "Ver histórico"}
                </button>
            </div>

            <div className="stage-track">
                {PROCESS_STAGES.map((stage, index) => (
                    <span
                        key={stage}
                        className={`task-pill ${index < currentIndex ? "low" : index === currentIndex ? "medium" : ""}`}
                        title={stage}
                    >
                        {stage}
                    </span>
                ))}
            </div>

            {isAtProtocolStep ? (
                <div className="form-grid" style={{ marginTop: 12 }}>
                    <label className="field">
                        <span>Data de entrada/protocolo</span>
                        <input
                            type="date"
                            value={protocolDraft.date}
                            onChange={(e) => setProtocolDraft((prev) => ({ ...prev, date: e.target.value }))}
                        />
                    </label>
                    <label className="field">
                        <span>Número do protocolo (opcional)</span>
                        <input
                            type="text"
                            value={protocolDraft.number}
                            onChange={(e) => setProtocolDraft((prev) => ({ ...prev, number: e.target.value }))}
                        />
                    </label>
                </div>
            ) : null}

            <div className="toolbar-row" style={{ marginTop: 12 }}>
                {currentIndex > 0 ? (
                    <button className="btn btn-ghost" type="button" onClick={goBack}>
                        ← Voltar etapa
                    </button>
                ) : null}

                {isAtBranchPoint ? (
                    <>
                        <button className="btn btn-primary" type="button" onClick={() => goToResult("Deferido")}>
                            Deferido
                        </button>
                        <button className="btn btn-danger" type="button" onClick={() => goToResult("Indeferido")}>
                            Indeferido
                        </button>
                    </>
                ) : currentStage !== "Finalizado" ? (
                    <button className="btn btn-primary" type="button" onClick={advance}>
                        Avançar etapa →
                    </button>
                ) : null}
            </div>

            {client.protocolDate ? (
                <p className="field-hint">
                    Data de protocolo registrada: <strong>{formatDate(client.protocolDate)}</strong>
                    {client.protocolNumber ? ` · Nº ${client.protocolNumber}` : ""} (não é alterada depois de definida).
                </p>
            ) : null}

            {showHistory ? (
                <div className="compact-list" style={{ marginTop: 12 }}>
                    {history.length ? (
                        history.map((entry) => (
                            <div className="compact-item" key={entry.id}>
                                <span>{new Date(entry.changedAt).toLocaleString("pt-BR")}</span>
                                <strong>{entry.previousStage} → {entry.newStage}</strong>
                            </div>
                        ))
                    ) : (
                        <p className="field-hint">Nenhuma mudança de etapa registrada ainda.</p>
                    )}
                </div>
            ) : null}
        </section>
    );
}
