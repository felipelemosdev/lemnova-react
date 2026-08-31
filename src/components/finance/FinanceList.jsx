// src/components/finance/FinanceList.jsx
// Migrado de: <table> dentro de #financeMovementsPanel em index.html + renderFinance(),
// buildFinanceRow(), buildFinanceSubgroupRow() de js/finance.js.

import { Fragment } from "react";
import { getFinanceMonthKey, formatMonthLabel, getFinanceFlow, getFinanceStatus, inferFinanceCategory } from "../../services/domain.js";
import { formatCurrency, formatDate } from "../../services/utils.js";

export default function FinanceList({ entries, findClient, onEdit, onDelete }) {
    const monthKeys = [...new Set(entries.map((entry) => getFinanceMonthKey(entry.date)))].sort((a, b) => b.localeCompare(a));

    return (
        <div className="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Categoria</th>
                        <th>Forma</th>
                        <th>Tipo de contrato</th>
                        <th>Descrição</th>
                        <th>Valor</th>
                        <th>Data</th>
                        <th>Situação</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="financeTableBody">
                    {monthKeys.map((monthKey) => {
                        const entriesOfMonth = entries.filter((entry) => getFinanceMonthKey(entry.date) === monthKey).sort((a, b) => b.date.localeCompare(a.date));
                        const incomeEntries = entriesOfMonth.filter((entry) => getFinanceFlow(entry) === "Entrada");
                        const expenseEntries = entriesOfMonth.filter((entry) => getFinanceFlow(entry) === "Saída");
                        const incomeTotal = incomeEntries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
                        const expenseTotal = expenseEntries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
                        const monthBalance = incomeTotal - expenseTotal;

                        return (
                            <Fragment key={monthKey}>
                                <tr>
                                    <td colSpan={9} style={{ fontWeight: 700 }}>
                                        {monthKey ? formatMonthLabel(monthKey) : "Sem data"}
                                        <span style={{ fontWeight: 400, color: "var(--color-muted)" }}> · Saldo do mês: {formatCurrency(monthBalance)}</span>
                                    </td>
                                </tr>

                                <SubgroupRow label={`Entradas (${incomeEntries.length})`} total={incomeTotal} color="#027a48" />
                                {incomeEntries.map((entry) => (
                                    <FinanceRow key={entry.id} entry={entry} findClient={findClient} onEdit={onEdit} onDelete={onDelete} />
                                ))}

                                <SubgroupRow label={`Saídas (${expenseEntries.length})`} total={expenseTotal} color="#b42318" />
                                {expenseEntries.map((entry) => (
                                    <FinanceRow key={entry.id} entry={entry} findClient={findClient} onEdit={onEdit} onDelete={onDelete} />
                                ))}
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>

            <p id="financeEmptyState" className={`empty-state ${entries.length ? "hidden" : ""}`}>
                Nenhuma movimentação cadastrada.
            </p>
        </div>
    );
}

function SubgroupRow({ label, total, color }) {
    return (
        <tr>
            <td colSpan={9} style={{ background: "rgba(2,32,58,0.03)", fontWeight: 600, fontSize: "0.82em", color }}>
                {label} <span style={{ fontWeight: 400, color: "var(--color-muted)" }}>· {formatCurrency(total)}</span>
            </td>
        </tr>
    );
}

function FinanceRow({ entry, findClient, onEdit, onDelete }) {
    const client = findClient(entry.clientId);
    const status = getFinanceStatus(entry);

    return (
        <tr>
            <td>
                <span className={`type-pill ${entry.type === "Saída" ? "out" : ""}`}>{getFinanceFlow(entry)}</span>
            </td>
            <td>{entry.category || inferFinanceCategory(entry)}</td>
            <td>{entry.method ? <span className="status-pill">{entry.method}</span> : "—"}</td>
            <td>{entry.contractType ? <span className="status-pill">{entry.contractType}</span> : "—"}</td>
            <td>
                <div className="transaction-cell">
                    <strong>{entry.description}</strong>
                    <span>{client ? client.name : "Sem cliente"}</span>
                </div>
            </td>
            <td>{formatCurrency(entry.amount)}</td>
            <td>{formatDate(entry.date)}</td>
            <td>
                <span className={`task-pill ${status === "Pendente" ? "medium" : status === "Cancelado" ? "" : "low"}`}>
                    {status}
                </span>
            </td>
            <td>
                <button className="action-button" type="button" onClick={() => onEdit(entry)}>Editar</button>
                <button className="action-button danger" type="button" onClick={() => onDelete(entry)}>Excluir</button>
            </td>
        </tr>
    );
}
