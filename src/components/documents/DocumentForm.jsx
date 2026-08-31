// src/components/documents/DocumentForm.jsx
// Migrado de: <form id="documentForm"> em index.html + handleDocumentSubmit() de
// js/documents.js, integrado com o hook useCnjLookup (ex-js/cnj.js).

import { useRef, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { documentsApi } from "../../services/api.js";
import { getExtension, isAllowedDocument, fileToDataURL } from "../../services/utils.js";
import { useCnjLookup } from "../../hooks/useCnjLookup.js";

const PHASE_OPTIONS = ["Cadastrado", "Em andamento", "Audiência", "Perícia", "Sentença", "Recurso", "Arquivado"];

function emptyForm() {
    return { title: "", clientId: "", processClass: "", processCourt: "", processPhase: "Cadastrado", processMovement: "" };
}

export default function DocumentForm() {
    const { clients, refresh } = useApp();
    const [form, setForm] = useState(emptyForm);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const cnj = useCnjLookup();

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleNumeroChange(value) {
        updateField("title", value);
        cnj.handleNumeroChange(value);
    }

    async function handleCnjSearch() {
        const result = await cnj.search(form.title);
        if (result) {
            setForm((prev) => ({
                ...prev,
                processClass: result.processClass || prev.processClass,
                processCourt: result.processCourt || prev.processCourt,
                processMovement: result.processMovement || prev.processMovement
            }));
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!file || !isAllowedDocument(file)) {
            alert("Envie um arquivo PDF, JPG ou PNG.");
            return;
        }

        let fileData = "";
        try {
            fileData = await fileToDataURL(file);
        } catch {
            alert("Não foi possível ler o arquivo do processo selecionado.");
            return;
        }

        const payload = {
            title: form.title.trim(),
            clientId: form.clientId,
            processClass: form.processClass.trim(),
            processCourt: form.processCourt.trim(),
            processPhase: form.processPhase,
            processMovement: form.processMovement.trim(),
            fileName: file.name,
            fileType: file.type || getExtension(file.name),
            fileSize: file.size,
            fileData
        };

        try {
            await documentsApi.create(payload);
        } catch {
            alert("Não foi possível salvar o arquivo no navegador. Tente um PDF ou imagem menor.");
            return;
        }

        await refresh();
        setForm(emptyForm());
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    return (
        <form id="documentForm" className="workspace-panel form-grid" onSubmit={handleSubmit}>
            <div className="section-heading full-width">
                <div>
                    <p className="eyebrow">Processo judicial</p>
                    <h3>Novo processo</h3>
                </div>
            </div>

            <label className="field">
                <span>Número CNJ</span>
                <input
                    id="documentTitle"
                    type="text"
                    placeholder="0000000-00.0000.0.00.0000"
                    required
                    value={form.title}
                    onChange={(e) => handleNumeroChange(e.target.value)}
                />
            </label>

            <div className="field full-width cnj-lookup">
                <span>Consulta automática no CNJ (DataJud)</span>
                <div className="cnj-lookup-row">
                    <select
                        id="cnjTribunal"
                        title="Tribunal identificado a partir do número CNJ"
                        value={cnj.tribunal}
                        onChange={(e) => cnj.setTribunal(e.target.value)}
                    >
                        <option value="">Tribunal (detectado automaticamente)</option>
                        {cnj.tribunalOptions.map((option) => (
                            <option key={option.alias} value={option.alias}>{option.label}</option>
                        ))}
                    </select>
                    <button type="button" id="cnjSearchBtn" className="btn btn-ghost" onClick={handleCnjSearch} disabled={cnj.loading}>
                        {cnj.loading ? "Consultando..." : "🔎 Buscar processo"}
                    </button>
                </div>
                <p id="cnjSearchStatus" className={`cnj-status ${cnj.status.kind}`}>{cnj.status.text}</p>
            </div>

            <label className="field">
                <span>Cliente relacionado</span>
                <select id="documentClient" value={form.clientId} onChange={(e) => updateField("clientId", e.target.value)}>
                    <option value="">Sem cliente vinculado</option>
                    {clients.map((client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span>Classe processual</span>
                <input
                    id="processClass"
                    type="text"
                    placeholder="Ex.: Procedimento comum cível"
                    required
                    value={form.processClass}
                    onChange={(e) => updateField("processClass", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Tribunal / Vara</span>
                <input
                    id="processCourt"
                    type="text"
                    placeholder="Ex.: TJSP - 2ª Vara Cível"
                    required
                    value={form.processCourt}
                    onChange={(e) => updateField("processCourt", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Fase</span>
                <select id="processPhase" required value={form.processPhase} onChange={(e) => updateField("processPhase", e.target.value)}>
                    {PHASE_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </label>

            <label className="field full-width">
                <span>Peça ou arquivo do processo em PDF, JPG ou PNG</span>
                <input
                    ref={fileInputRef}
                    id="documentFile"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    required
                    onChange={(e) => setFile(e.target.files[0] || null)}
                />
            </label>

            <label className="field full-width">
                <span>Movimentação / observação</span>
                <textarea
                    id="processMovement"
                    rows={4}
                    placeholder="Resumo da última movimentação, partes ou prazo relevante"
                    value={form.processMovement}
                    onChange={(e) => updateField("processMovement", e.target.value)}
                />
            </label>

            <button className="btn btn-primary full-width" type="submit">
                Adicionar processo
            </button>
        </form>
    );
}
