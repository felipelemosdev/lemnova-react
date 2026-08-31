// src/pages/Financeiro.jsx
// Migrado de: <section id="financeSection"> em index.html + o "roteador" de abas
// (financeTabMovements/Receivables/Payables/Cashflow) e de ações
// (handleFinanceTableClick/confirmFinanceDelete/markFinanceStatus) de js/finance.js.

import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { financeApi, markFinanceStatus } from "../services/api.js";
import {
    calculateFinanceTotals,
    calculateFutureFinanceTotals,
    calculatePendingInstallmentsSummary,
    getReceivables,
    getPayables,
    calculateCashFlowByMonth,
    getFinanceMonthKey
} from "../services/domain.js";
import { printFinanceReport, printReceivablesReport, printPayablesReport, printCashflowReport } from "../services/print.js";
import FinanceForm from "../components/finance/FinanceForm.jsx";
import FinanceSummary from "../components/finance/FinanceSummary.jsx";
import FinanceList from "../components/finance/FinanceList.jsx";
import { ReceivablesPanel, PayablesPanel, CashflowPanel } from "../components/finance/FinancePendingPanels.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const TABS = [
    { id: "movements", label: "Movimentações" },
    { id: "receivables", label: "Contas a Receber" },
    { id: "payables", label: "Contas a Pagar" },
    { id: "cashflow", label: "Fluxo de Caixa" }
];

export default function Financeiro() {
    const { finance, installments, findClient, refresh } = useApp();
    const [tab, setTab] = useState("movements");
    const [search, setSearch] = useState("");
    const [monthFilter, setMonthFilter] = useState("all");
    const [receivablesMonthFilter, setReceivablesMonthFilter] = useState(getFinanceMonthKey(new Date().toISOString()));
    const [payablesMonthFilter, setPayablesMonthFilter] = useState(getFinanceMonthKey(new Date().toISOString()));
    const [editingEntry, setEditingEntry] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);

    const totals = calculateFinanceTotals(finance);
    const futureTotals = calculateFutureFinanceTotals(finance);
    const pendingInstallmentsSummary = calculatePendingInstallmentsSummary(installments);

    const searchTerm = search.trim().toLowerCase();
    const filteredEntries = finance.filter((entry) => {
        if (monthFilter !== "all" && getFinanceMonthKey(entry.date) !== monthFilter) {
            return false;
        }
        if (!searchTerm) return true;
        const client = findClient(entry.clientId);
        const content = [entry.description, entry.category, entry.contractType, entry.type, client ? client.name : ""].join(" ").toLowerCase();
        return content.includes(searchTerm);
    });

    const allReceivables = getReceivables(finance);
    const allPayables = getPayables(finance);
    const cashFlowRows = calculateCashFlowByMonth(finance);

    function startEdit(entry) {
        setEditingEntry(entry);
    }

    async function confirmDelete() {
        await financeApi.remove(pendingDelete.id);
        if (editingEntry?.id === pendingDelete.id) {
            setEditingEntry(null);
        }
        await refresh();
        setPendingDelete(null);
    }

    async function handleMarkStatus(entryId, status) {
        await markFinanceStatus(entryId, status);
        await refresh();
    }

    const monthLabelForPrint = (key) => {
        if (!key || key === "all") return "Todos os meses";
        const [year, month] = key.split("-").map(Number);
        const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(Date.UTC(year, month - 1, 1)));
        return label.charAt(0).toUpperCase() + label.slice(1);
    };

    return (
        <section id="financeSection" className="content-section active-section">
            <FinanceSummary totals={totals} futureTotals={futureTotals} pendingInstallmentsSummary={pendingInstallmentsSummary} />

            <div className="client-toolbar">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        id={`financeTab${t.id.charAt(0).toUpperCase()}${t.id.slice(1)}`}
                        className={`btn ${tab === t.id ? "btn-primary" : "btn-ghost"}`}
                        type="button"
                        onClick={() => setTab(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "movements" ? (
                <div id="financeMovementsPanel" className="workspace-grid">
                    <FinanceForm
                        key={editingEntry?.id ?? "new"}
                        editingEntry={editingEntry}
                        onCancelEdit={() => setEditingEntry(null)}
                        onSaved={() => setEditingEntry(null)}
                    />

                    <section className="workspace-panel">
                        <div className="section-heading">
                            <div>
                                <p className="eyebrow">Controle financeiro</p>
                                <h3>Movimentações</h3>
                            </div>
                            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                                <label className="field" style={{ minWidth: 220 }}>
                                    <span>Buscar</span>
                                    <input id="financeSearch" type="search" placeholder="Descrição, cliente, categoria..." value={search} onChange={(e) => setSearch(e.target.value)} />
                                </label>
                                <label className="field" style={{ minWidth: 200 }}>
                                    <span>Mês</span>
                                    <select id="financeMonthFilter" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                                        <option value="all">Todos os meses</option>
                                        {[...new Set(finance.map((entry) => getFinanceMonthKey(entry.date)).filter(Boolean))]
                                            .sort((a, b) => b.localeCompare(a))
                                            .map((key) => (
                                                <option key={key} value={key}>{monthLabelForPrint(key)}</option>
                                            ))}
                                    </select>
                                </label>
                                <button
                                    id="printFinanceReportButton"
                                    className="btn btn-ghost btn-print"
                                    type="button"
                                    onClick={() =>
                                        printFinanceReport(filteredEntries, {
                                            totals,
                                            futureTotals,
                                            monthLabel: monthLabelForPrint(monthFilter),
                                            searchTerm: search.trim(),
                                            findClient
                                        })
                                    }
                                >
                                    🖨 Imprimir relatório
                                </button>
                            </div>
                        </div>

                        <FinanceList entries={filteredEntries} findClient={findClient} onEdit={startEdit} onDelete={(entry) => setPendingDelete(entry)} />
                    </section>
                </div>
            ) : null}

            {tab === "receivables" ? (
                <ReceivablesPanel
                    allReceivables={allReceivables}
                    monthFilter={receivablesMonthFilter}
                    onMonthFilterChange={setReceivablesMonthFilter}
                    findClient={findClient}
                    onMarkReceived={(id) => handleMarkStatus(id, "Recebido")}
                    onDelete={(entry) => setPendingDelete(entry)}
                    onPrint={() =>
                        printReceivablesReport(
                            receivablesMonthFilter === "all" ? allReceivables : allReceivables.filter((e) => getFinanceMonthKey(e.date) === receivablesMonthFilter),
                            findClient
                        )
                    }
                />
            ) : null}

            {tab === "payables" ? (
                <PayablesPanel
                    allPayables={allPayables}
                    monthFilter={payablesMonthFilter}
                    onMonthFilterChange={setPayablesMonthFilter}
                    onMarkPaid={(id) => handleMarkStatus(id, "Pago")}
                    onDelete={(entry) => setPendingDelete(entry)}
                    onPrint={() =>
                        printPayablesReport(payablesMonthFilter === "all" ? allPayables : allPayables.filter((e) => getFinanceMonthKey(e.date) === payablesMonthFilter))
                    }
                />
            ) : null}

            {tab === "cashflow" ? <CashflowPanel rows={cashFlowRows} onPrint={() => printCashflowReport(cashFlowRows)} /> : null}

            <ConfirmDialog
                open={Boolean(pendingDelete)}
                title="Excluir lançamento"
                text="Esta ação removerá o gasto ou compra lançado por engano."
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />
        </section>
    );
}
