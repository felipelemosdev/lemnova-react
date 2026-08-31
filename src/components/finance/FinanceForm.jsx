// src/components/finance/FinanceForm.jsx
// Migrado de: <form id="financeForm"> em index.html + handleFinanceSubmit(),
// updateFinanceCategoryOptions(), updateFinanceStatusOptions() de js/finance.js.
//
// Parcelamento genérico (campo "Parcelas" abaixo) é diferente das parcelas de contrato
// da aba Contratos: aqui é só pra dividir QUALQUER lançamento (ex.: um custo de escritório
// pago em 4x) em N lançamentos mensais no Financeiro — não mexe na coleção de parcelas
// nem no cliente.

import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { financeApi, updateFinanceEntry } from "../../services/api.js";
import { getFinanceCategoryOptions, getFinanceStatusOptions, createId, addMonthsISO, todayISO } from "../../services/utils.js";

const PAYMENT_METHODS = ["PIX", "TED", "DOC", "Dinheiro", "Cartão", "Boleto", "Cheque", "Outros"];
const CONTRACT_TYPES = [
    "Aposentadoria", "Auxílio-Doença", "Auxílio-Acidente", "Doença Ocupacional",
    "Pensão por Morte", "Trabalhista", "Maternidade", "Majoração", "LOAS Idoso", "LOAS Deficiente", "Consumidor"
];

function emptyForm() {
    const categories = getFinanceCategoryOptions("Entrada");
    const statuses = getFinanceStatusOptions("Entrada");
    return {
        type: "Entrada",
        category: categories[0] || "",
        method: PAYMENT_METHODS[0],
        status: statuses[1] || statuses[0] || "",
        responsible: "",
        contractType: "",
        amount: "",
        date: todayISO(),
        installmentsCount: 1,
        clientId: "",
        description: ""
    };
}

function entryToForm(entry) {
    return {
        type: entry.type,
        category: entry.category || "",
        method: entry.method || PAYMENT_METHODS[0],
        status: entry.status || "",
        responsible: entry.responsible || "",
        contractType: entry.contractType || "",
        amount: entry.amount ?? "",
        date: entry.date,
        installmentsCount: 1,
        clientId: entry.clientId || "",
        description: entry.description || ""
    };
}

export default function FinanceForm({ editingEntry, onCancelEdit, onSaved }) {
    const { clients, refresh } = useApp();
    const [form, setForm] = useState(() => (editingEntry ? entryToForm(editingEntry) : emptyForm()));

    // Recalcula Categoria/Situação no próprio evento que disparou a mudança (Tipo de
    // fluxo ou Data) — em vez de um useEffect "espiando" o estado depois do render.
    // Mesmo resultado de updateFinanceCategoryOptions()/updateFinanceStatusOptions() do
    // app original, só que resolvido no evento, não depois dele.
    function recalculateDefaults(next) {
        const categories = getFinanceCategoryOptions(next.type);
        const statuses = getFinanceStatusOptions(next.type);
        const defaultStatus = next.date > todayISO() ? "Pendente" : statuses[1] || statuses[0];
        return {
            ...next,
            category: categories.includes(next.category) ? next.category : categories[0] || "",
            status: defaultStatus
        };
    }

    function updateField(field, value) {
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            return field === "type" || field === "date" ? recalculateDefaults(next) : next;
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        // Modo edição: atualiza o lançamento existente no lugar, sem gerar série de
        // parcelas (isso só se aplica à criação de um lançamento novo).
        if (editingEntry) {
            await updateFinanceEntry(editingEntry.id, {
                type: form.type,
                category: form.category,
                method: form.method,
                responsible: form.responsible.trim(),
                contractType: form.contractType,
                amount: Number(form.amount),
                clientId: form.clientId,
                status: form.status,
                date: form.date,
                description: form.description.trim()
            });
            await refresh();
            onSaved();
            return;
        }

        const installmentsCount = Math.min(60, Math.max(1, Math.trunc(Number(form.installmentsCount)) || 1));
        const isInstallmentSeries = installmentsCount > 1;
        const groupId = isInstallmentSeries ? createId() : null;
        const baseDescription = form.description.trim();

        const baseEntry = {
            type: form.type,
            category: form.category,
            method: form.method,
            responsible: form.responsible.trim(),
            contractType: form.contractType,
            amount: Number(form.amount),
            clientId: form.clientId
        };

        const newEntries = [];
        for (let index = 0; index < installmentsCount; index += 1) {
            const entryDate = index === 0 ? form.date : addMonthsISO(form.date, index);
            const status = isInstallmentSeries
                ? entryDate > todayISO()
                    ? "Pendente"
                    : form.type === "Saída"
                      ? "Pago"
                      : "Recebido"
                : form.status;

            newEntries.push({
                ...baseEntry,
                status,
                date: entryDate,
                description: isInstallmentSeries ? `${baseDescription} (${index + 1}/${installmentsCount})` : baseDescription,
                installmentGroupId: groupId,
                installmentIndex: isInstallmentSeries ? index + 1 : null,
                installmentTotal: isInstallmentSeries ? installmentsCount : null
            });
        }

        for (const entry of newEntries) {
            await financeApi.create(entry);
        }

        await refresh();
        setForm(emptyForm());
    }

    return (
        <form id="financeForm" className="workspace-panel form-grid" onSubmit={handleSubmit}>
            <div className="section-heading full-width">
                <div>
                    <p className="eyebrow">Lançamento</p>
                    <h3>{editingEntry ? "Editar lançamento" : "Nova movimentação"}</h3>
                </div>
                {editingEntry ? (
                    <button className="btn btn-ghost" type="button" onClick={onCancelEdit}>
                        Cancelar edição
                    </button>
                ) : null}
            </div>

            <label className="field">
                <span>Tipo de fluxo</span>
                <select id="financeType" required value={form.type} onChange={(e) => updateField("type", e.target.value)}>
                    <option value="Entrada">Entrada</option>
                    <option value="Saída">Saída</option>
                </select>
            </label>

            <label className="field">
                <span>Categoria</span>
                <select id="financeCategory" required value={form.category} onChange={(e) => updateField("category", e.target.value)}>
                    {getFinanceCategoryOptions(form.type).map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span>Forma de pagamento</span>
                <select id="financeMethod" required value={form.method} onChange={(e) => updateField("method", e.target.value)}>
                    {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>{method}</option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span>Situação</span>
                <select id="financeStatus" required value={form.status} onChange={(e) => updateField("status", e.target.value)}>
                    {getFinanceStatusOptions(form.type).map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span>Responsável</span>
                <input
                    id="financeResponsible"
                    type="text"
                    placeholder="Ex.: Dr. Ricardo Almeida"
                    value={form.responsible}
                    onChange={(e) => updateField("responsible", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Tipo de contrato</span>
                <select id="financeContractType" value={form.contractType} onChange={(e) => updateField("contractType", e.target.value)}>
                    <option value="">Não vinculado</option>
                    {CONTRACT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span>Valor (por parcela, se parcelado)</span>
                <input
                    id="financeAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    required
                    value={form.amount}
                    onChange={(e) => updateField("amount", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Data (1ª parcela, se parcelado)</span>
                <input id="financeDate" type="date" required value={form.date} onChange={(e) => updateField("date", e.target.value)} />
            </label>
            <p className="field-hint full-width">
                Use uma data futura para lançar algo já previsto (ex.: parcela a receber, pagamento agendado) — ele
                entra em "Lançamentos futuros" e só conta no saldo quando a data chegar.
            </p>

            <label className="field">
                <span>Parcelas</span>
                <input
                    id="financeInstallmentsCount"
                    type="number"
                    min="1"
                    max="60"
                    step="1"
                    value={form.installmentsCount}
                    onChange={(e) => updateField("installmentsCount", e.target.value)}
                />
            </label>
            <p className="field-hint full-width">
                Deixe 1 para lançamento único. Acima de 1, gera uma parcela por mês a partir da Data informada (ex.:
                compra parcelada 4x, cheques parcelados) — cada uma entra em Contas a Receber/Pagar até o vencimento.
            </p>

            <label className="field">
                <span>Cliente</span>
                <select id="financeClient" value={form.clientId} onChange={(e) => updateField("clientId", e.target.value)}>
                    <option value="">Sem cliente vinculado</option>
                    {clients.map((client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                </select>
            </label>

            <label className="field full-width">
                <span>Descrição</span>
                <input
                    id="financeDescription"
                    type="text"
                    placeholder="Ex.: Entrada de contrato, custas, repasse"
                    required
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                />
            </label>

            <button className="btn btn-primary full-width" type="submit">
                {editingEntry ? "Salvar alterações" : "Salvar lançamento"}
            </button>
        </form>
    );
}
