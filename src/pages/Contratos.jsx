// src/pages/Contratos.jsx
// Migrado de: <section id="contractsSection"> em index.html + handleContractsTableClick/
// handleRpvTableClick/getFilteredInstallments/renderContractsSection de js/installments.js.
//
// Isto é a aba "Contratos" de controle financeiro (parcelas + RPV) — diferente do
// gerador de textos de contrato (js/contract.js + js/contract/*.js), que é a Fase 7.

import { useState, Fragment } from "react";
import { useApp } from "../context/AppContext.jsx";
import { setInstallmentPaid, deleteInstallmentCascade, toggleRpvReceived, clearClientRpv } from "../services/api.js";
import { calculateContractIndicators, getInstallmentStatus, getFinanceMonthKey, formatMonthLabel, isRpvActive, INSTALLMENT_STATUS_LABELS, INSTALLMENT_STATUS_PILL_CLASS } from "../services/domain.js";
import { formatCurrency, formatDate, todayISO } from "../services/utils.js";
import { printContractsReport } from "../services/print.js";
import InstallmentModal from "../components/contracts/InstallmentModal.jsx";
import RpvEditModal from "../components/contracts/RpvEditModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const STATUS_FILTER_OPTIONS = [
    { value: "pending", label: "Pendentes" },
    { value: "overdue", label: "Vencidas" },
    { value: "today", label: "Vencendo hoje" },
    { value: "upcoming", label: "A vencer" },
    { value: "all", label: "Todas" }
];

export default function Contratos() {
    const { installments, clients, findClient, refresh } = useApp();
    const [statusFilter, setStatusFilter] = useState("pending");
    const [monthFilter, setMonthFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [installmentModal, setInstallmentModal] = useState(null); // { editingInstallment } | { new: true } | null
    const [rpvModalClient, setRpvModalClient] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null); // { type: "installment" | "rpv", ... }

    const indicators = calculateContractIndicators(installments, clients);
    const searchTerm = search.trim().toLowerCase();

    const filteredInstallments = installments
        .filter((installment) => {
            const status = getInstallmentStatus(installment);
            if (statusFilter === "overdue" && !["overdue", "overdue30"].includes(status)) return false;
            if (statusFilter === "upcoming" && status !== "upcoming") return false;
            if (statusFilter === "today" && status !== "today") return false;
            if (statusFilter === "pending" && installment.paid) return false;
            if (monthFilter !== "all" && getFinanceMonthKey(installment.dueDate) !== monthFilter) return false;
            if (searchTerm) {
                const client = findClient(installment.clientId);
                if (!client || !client.name.toLowerCase().includes(searchTerm)) return false;
            }
            return true;
        })
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const monthKeys = [...new Set(filteredInstallments.map((installment) => getFinanceMonthKey(installment.dueDate)))].sort((a, b) => a.localeCompare(b));
    const allMonthKeys = [...new Set(installments.map((installment) => getFinanceMonthKey(installment.dueDate)))].sort((a, b) => a.localeCompare(b));

    const rpvClients = clients.filter((client) => Number(client.rpvValue) > 0 && (!searchTerm || client.name.toLowerCase().includes(searchTerm)));

    async function handleTogglePaid(installment) {
        await setInstallmentPaid(installment.id, !installment.paid);
        await refresh();
    }

    async function handleToggleRpv(clientId) {
        await toggleRpvReceived(clientId);
        await refresh();
    }

    async function confirmDelete() {
        if (pendingDelete.type === "installment") {
            await deleteInstallmentCascade(pendingDelete.installment.id);
        } else {
            await clearClientRpv(pendingDelete.client.id);
        }
        await refresh();
        setPendingDelete(null);
    }

    const statusLabelForPrint = STATUS_FILTER_OPTIONS.find((option) => option.value === statusFilter)?.label || "Todas";
    const monthLabelForPrint = monthFilter === "all" ? "Todos os meses" : formatMonthLabel(monthFilter);

    return (
        <section id="contractsSection" className="content-section active-section">
            <div className="finance-overview">
                <article className="summary-card"><span>Vencidos</span><strong>{indicators.overdue}</strong><p>Parcelas em atraso</p></article>
                <article className="summary-card"><span>Vencendo hoje</span><strong>{indicators.dueToday}</strong><p>Parcelas com vencimento hoje</p></article>
                <article className="summary-card"><span>Receber hoje</span><strong>{indicators.receiveToday}</strong><p>RPVs previstos para hoje</p></article>
                <article className="summary-card"><span>A vencer</span><strong>{indicators.upcoming}</strong><p>Parcelas futuras</p></article>
                <article className="summary-card"><span>Vencido +30 dias</span><strong>{indicators.overdue30}</strong><p>Atraso crítico</p></article>
            </div>

            <section className="workspace-panel">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">Contratos</p>
                        <h3>Parcelas</h3>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                        <label className="field" style={{ minWidth: 200 }}>
                            <span>Buscar cliente</span>
                            <input id="contractsSearch" type="search" placeholder="Nome do cliente" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </label>
                        <label className="field" style={{ minWidth: 160 }}>
                            <span>Status</span>
                            <select id="contractsFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                {STATUS_FILTER_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </label>
                        <label className="field" style={{ minWidth: 180 }}>
                            <span>Mês</span>
                            <select id="contractsMonthFilter" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                                <option value="all">Todos os meses</option>
                                {allMonthKeys.map((key) => (
                                    <option key={key} value={key}>{formatMonthLabel(key)}</option>
                                ))}
                            </select>
                        </label>
                        <button id="addInstallmentButton" className="btn btn-ghost" type="button" onClick={() => setInstallmentModal({ new: true })}>
                            + Parcela avulsa
                        </button>
                        <button
                            id="printContractsReportButton"
                            className="btn btn-ghost btn-print"
                            type="button"
                            onClick={() =>
                                printContractsReport(filteredInstallments, {
                                    indicators,
                                    monthLabel: monthLabelForPrint,
                                    statusLabel: statusLabelForPrint,
                                    searchTerm: search.trim(),
                                    clients,
                                    findClient
                                })
                            }
                        >
                            🖨 Imprimir
                        </button>
                    </div>
                </div>

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr><th>Cliente</th><th>Benefício</th><th>Parcela</th><th>Valor</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr>
                        </thead>
                        <tbody id="contractsTableBody">
                            {monthKeys.map((monthKey) => {
                                const installmentsOfMonth = filteredInstallments.filter((installment) => getFinanceMonthKey(installment.dueDate) === monthKey);
                                const monthTotal = installmentsOfMonth.reduce((sum, installment) => sum + (Number(installment.amount) || 0), 0);
                                return (
                                    <Fragment key={monthKey}>
                                        <tr>
                                            <td colSpan={7} style={{ fontWeight: 700 }}>
                                                {monthKey ? formatMonthLabel(monthKey) : "Sem vencimento"}
                                                <span style={{ fontWeight: 400, color: "var(--color-muted)" }}> · {installmentsOfMonth.length} parcela(s) · Total: {formatCurrency(monthTotal)}</span>
                                            </td>
                                        </tr>
                                        {installmentsOfMonth.map((installment) => {
                                            const client = findClient(installment.clientId);
                                            const status = getInstallmentStatus(installment);
                                            return (
                                                <tr key={installment.id}>
                                                    <td>{client ? client.name : "Cliente removido"}</td>
                                                    <td>{client ? client.benefit || "-" : "-"}</td>
                                                    <td>{installment.total ? `${installment.number}/${installment.total}` : "Avulsa"}</td>
                                                    <td>{formatCurrency(installment.amount)}</td>
                                                    <td>{formatDate(installment.dueDate)}</td>
                                                    <td><span className={`task-pill ${INSTALLMENT_STATUS_PILL_CLASS[status]}`}>{INSTALLMENT_STATUS_LABELS[status]}</span></td>
                                                    <td className="event-actions">
                                                        <button className={`action-button ${installment.paid ? "" : "complete"}`} type="button" onClick={() => handleTogglePaid(installment)}>
                                                            {installment.paid ? "↺ Desfazer" : "✓ Marcar paga"}
                                                        </button>
                                                        <button className="action-button" type="button" onClick={() => setInstallmentModal({ editingInstallment: installment })}>
                                                            Editar
                                                        </button>
                                                        <button className="action-button danger" type="button" onClick={() => setPendingDelete({ type: "installment", installment })}>
                                                            Excluir
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <p id="contractsEmptyState" className={`empty-state ${filteredInstallments.length ? "hidden" : ""}`}>
                    Nenhuma parcela encontrada para os filtros aplicados.
                </p>
            </section>

            <section className="workspace-panel">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">Contratos</p>
                        <h3>RPV</h3>
                    </div>
                </div>
                <p className="field-hint">
                    O RPV só entra em vigor (vira conta a receber de verdade) quando o pedido administrativo é
                    indeferido. Enquanto isso, aparece aqui só como previsão, sem contar nos indicadores acima.
                </p>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr><th>Cliente</th><th>Administrativo</th><th>Valor do RPV</th><th>Previsão</th><th>Status</th><th>Ações</th></tr>
                        </thead>
                        <tbody id="rpvTableBody">
                            {rpvClients.map((client) => {
                                const active = isRpvActive(client);
                                const isToday = active && client.rpvDate === todayISO() && !client.rpvReceived;
                                const statusLabel = !active
                                    ? "Aguardando indeferimento"
                                    : client.rpvReceived
                                      ? "Recebido"
                                      : isToday
                                        ? "Receber hoje"
                                        : "Aguardando";
                                const statusClass = !active ? "" : client.rpvReceived ? "low" : isToday ? "medium" : "low";
                                return (
                                    <tr key={client.id}>
                                        <td>{client.name}</td>
                                        <td>
                                            <span className={`task-pill ${client.administrativeStatus === "Indeferido" ? "high" : client.administrativeStatus === "Deferido" ? "low" : "medium"}`}>
                                                {client.administrativeStatus || "Em andamento"}
                                            </span>
                                        </td>
                                        <td>{formatCurrency(client.rpvValue)}</td>
                                        <td>{client.rpvDate ? formatDate(client.rpvDate) : "Sem previsão"}</td>
                                        <td>
                                            <span className={`task-pill ${statusClass}`}>{statusLabel}</span>
                                        </td>
                                        <td className="event-actions">
                                            <button
                                                className={`action-button ${client.rpvReceived ? "" : "complete"}`}
                                                type="button"
                                                disabled={!active}
                                                title={active ? undefined : "Só é possível marcar recebido depois do administrativo ser indeferido"}
                                                onClick={() => handleToggleRpv(client.id)}
                                            >
                                                {client.rpvReceived ? "↺ Desfazer" : "✓ Marcar recebido"}
                                            </button>
                                            <button className="action-button" type="button" onClick={() => setRpvModalClient(client)}>
                                                Editar
                                            </button>
                                            <button className="action-button danger" type="button" onClick={() => setPendingDelete({ type: "rpv", client })}>
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <p id="rpvEmptyState" className={`empty-state ${rpvClients.length ? "hidden" : ""}`}>
                    Nenhum RPV cadastrado.
                </p>
            </section>

            {installmentModal ? (
                <InstallmentModal
                    key={installmentModal.editingInstallment?.id ?? "new"}
                    editingInstallment={installmentModal.editingInstallment}
                    onClose={() => setInstallmentModal(null)}
                    onSaved={refresh}
                />
            ) : null}

            {rpvModalClient ? (
                <RpvEditModal key={rpvModalClient.id} client={rpvModalClient} onClose={() => setRpvModalClient(null)} onSaved={refresh} />
            ) : null}

            <ConfirmDialog
                open={Boolean(pendingDelete)}
                title={pendingDelete?.type === "installment" ? "Excluir parcela" : "Excluir RPV"}
                text={
                    pendingDelete?.type === "installment"
                        ? "Esta ação removerá a parcela e o lançamento espelhado no Financeiro."
                        : "Esta ação limpará os dados de RPV deste cliente."
                }
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />
        </section>
    );
}
