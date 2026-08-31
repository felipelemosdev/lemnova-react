// src/components/finance/FinanceSummary.jsx
// Migrado de: .finance-overview no topo de <section id="financeSection"> em index.html +
// renderFinanceSummary() de js/finance.js.

import { formatCurrency } from "../../services/utils.js";

export default function FinanceSummary({ totals, futureTotals, pendingInstallmentsSummary }) {
    return (
        <div className="finance-overview">
            <article className="summary-card">
                <span>Honorários</span>
                <strong id="feesTotal">{formatCurrency(totals.fees)}</strong>
                <p>Entradas realizadas</p>
            </article>
            <article className="summary-card">
                <span>Custo de escritório</span>
                <strong id="paymentsTotal">{formatCurrency(totals.officeCosts)}</strong>
                <p>Saídas realizadas</p>
            </article>
            <article className="summary-card">
                <span>Saldo do caixa</span>
                <strong id="receiptsTotal">{formatCurrency(totals.balance)}</strong>
                <p>Realizado até hoje</p>
            </article>
            <article className="summary-card">
                <span>Lançamentos futuros</span>
                <strong id="futureBalanceTotal">{formatCurrency(futureTotals.balance)}</strong>
                <p id="futureBalanceCount">{futureTotals.count} lançamento(s) previsto(s)</p>
            </article>
            <article className="summary-card">
                <span>Parcelas a receber</span>
                <strong id="installmentsReceivableTotal">{formatCurrency(pendingInstallmentsSummary.total)}</strong>
                <p id="installmentsReceivableCount">{pendingInstallmentsSummary.count} parcela(s) em aberto</p>
            </article>
        </div>
    );
}
