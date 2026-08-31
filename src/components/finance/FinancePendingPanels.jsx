// src/components/finance/FinancePendingPanels.jsx
// Migrado de: #financeReceivablesPanel, #financePayablesPanel, #financeCashflowPanel em
// index.html + renderReceivables(), renderPayables(), renderCashFlow(), daysOverdueLabel()
// de js/finance.js.
//
// "Contas a Receber/Pagar" não são uma coleção separada: são os próprios lançamentos do
// Financeiro com status "Pendente", filtrados por fluxo — por isso não têm formulário
// próprio, só ações (marcar recebido/pago, excluir) sobre os mesmos lançamentos.

import { getFinanceMonthKey, formatMonthLabel } from "../../services/domain.js";
import { formatCurrency, formatDate, todayISO, diffDaysISO } from "../../services/utils.js";

function DaysOverdue({ dateISO }) {
    const today = todayISO();
    if (!dateISO || dateISO >= today) return "—";
    const days = diffDaysISO(today, dateISO);
    return <span className="task-pill medium">{days} dia(s)</span>;
}

function MonthFilterSelect({ entries, value, onChange }) {
    const monthKeys = [...new Set([getFinanceMonthKey(todayISO()), ...entries.map((entry) => getFinanceMonthKey(entry.date)).filter(Boolean)])].sort(
        (a, b) => a.localeCompare(b)
    );

    return (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="all">Todos os meses</option>
            {monthKeys.map((key) => (
                <option key={key} value={key}>{formatMonthLabel(key)}</option>
            ))}
        </select>
    );
}

export function ReceivablesPanel({ allReceivables, monthFilter, onMonthFilterChange, findClient, onMarkReceived, onDelete, onPrint }) {
    const receivables = monthFilter === "all" ? allReceivables : allReceivables.filter((entry) => getFinanceMonthKey(entry.date) === monthFilter);
    const total = receivables.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);

    return (
        <section id="financeReceivablesPanel" className="workspace-panel">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">Contas a Receber</p>
                    <h3>Recebimentos pendentes</h3>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                    <label className="field" style={{ margin: 0 }}>
                        <span>Mês</span>
                        <MonthFilterSelect entries={allReceivables} value={monthFilter} onChange={onMonthFilterChange} />
                    </label>
                    <span id="receivablesSummary" className="status-pill">{formatCurrency(total)} em aberto · {receivables.length} conta(s)</span>
                    <button id="printReceivablesReportButton" className="btn btn-ghost btn-print" type="button" onClick={onPrint}>
                        🖨 Imprimir
                    </button>
                </div>
            </div>
            <div className="table-wrap">
                <table>
                    <thead>
                        <tr><th>Cliente</th><th>Categoria</th><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Dias em atraso</th><th>Status</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                        {receivables.map((entry) => {
                            const client = findClient(entry.clientId);
                            return (
                                <tr key={entry.id}>
                                    <td>{client ? client.name : "Sem cliente"}</td>
                                    <td>{entry.category || "Recebimento"}</td>
                                    <td>{entry.description}</td>
                                    <td>{formatCurrency(entry.amount)}</td>
                                    <td>{formatDate(entry.date)}</td>
                                    <td><DaysOverdue dateISO={entry.date} /></td>
                                    <td><span className="task-pill medium">{entry.status || "Pendente"}</span></td>
                                    <td>
                                        <button className="action-button complete" type="button" onClick={() => onMarkReceived(entry.id)}>✓ Recebido</button>
                                        <button className="action-button danger" type="button" onClick={() => onDelete(entry)}>Excluir</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <p id="financeReceivablesEmptyState" className={`empty-state ${receivables.length ? "hidden" : ""}`}>
                Nenhuma conta a receber em aberto.
            </p>
        </section>
    );
}

export function PayablesPanel({ allPayables, monthFilter, onMonthFilterChange, onMarkPaid, onDelete, onPrint }) {
    const payables = monthFilter === "all" ? allPayables : allPayables.filter((entry) => getFinanceMonthKey(entry.date) === monthFilter);
    const total = payables.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);

    return (
        <section id="financePayablesPanel" className="workspace-panel">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">Contas a Pagar</p>
                    <h3>Pagamentos pendentes</h3>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                    <label className="field" style={{ margin: 0 }}>
                        <span>Mês</span>
                        <MonthFilterSelect entries={allPayables} value={monthFilter} onChange={onMonthFilterChange} />
                    </label>
                    <span id="payablesSummary" className="status-pill">{formatCurrency(total)} em aberto · {payables.length} conta(s)</span>
                    <button id="printPayablesReportButton" className="btn btn-ghost btn-print" type="button" onClick={onPrint}>
                        🖨 Imprimir
                    </button>
                </div>
            </div>
            <div className="table-wrap">
                <table>
                    <thead>
                        <tr><th>Fornecedor/Descrição</th><th>Categoria</th><th>Valor</th><th>Vencimento</th><th>Dias em atraso</th><th>Status</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                        {payables.map((entry) => (
                            <tr key={entry.id}>
                                <td>{entry.description}</td>
                                <td>{entry.category || "Custo de escritório"}</td>
                                <td>{formatCurrency(entry.amount)}</td>
                                <td>{formatDate(entry.date)}</td>
                                <td><DaysOverdue dateISO={entry.date} /></td>
                                <td><span className="task-pill medium">{entry.status || "Pendente"}</span></td>
                                <td>
                                    <button className="action-button complete" type="button" onClick={() => onMarkPaid(entry.id)}>✓ Pago</button>
                                    <button className="action-button danger" type="button" onClick={() => onDelete(entry)}>Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p id="financePayablesEmptyState" className={`empty-state ${payables.length ? "hidden" : ""}`}>
                Nenhuma conta a pagar em aberto.
            </p>
        </section>
    );
}

export function CashflowPanel({ rows, onPrint }) {
    return (
        <section id="financeCashflowPanel" className="workspace-panel">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">Fluxo de Caixa</p>
                    <h3>Resumo mensal</h3>
                </div>
                <button id="printCashflowReportButton" className="btn btn-ghost btn-print" type="button" onClick={onPrint}>
                    🖨 Imprimir
                </button>
            </div>
            <div className="table-wrap">
                <table>
                    <thead>
                        <tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo do mês</th><th>Saldo acumulado</th></tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.monthKey}>
                                <td style={{ fontWeight: 600 }}>{formatMonthLabel(row.monthKey)}</td>
                                <td>{formatCurrency(row.income)}</td>
                                <td>{formatCurrency(row.expense)}</td>
                                <td>{formatCurrency(row.monthBalance)}</td>
                                <td style={{ color: row.accumulated < 0 ? "#b42318" : "#027a48", fontWeight: 600 }}>{formatCurrency(row.accumulated)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p id="financeCashflowEmptyState" className={`empty-state ${rows.length ? "hidden" : ""}`}>
                Nenhuma movimentação cadastrada.
            </p>
        </section>
    );
}
