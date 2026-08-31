// src/services/print.js
// Migrado de: js/print.js — monta o HTML de uma janela de impressão com o timbre
// (cabeçalho/rodapé) do Lemnova. Usado por qualquer relatório impresso do sistema
// (eventos concluídos, tarefas, e futuramente contratos/financeiro).
//
// Continua puxando o CSS de impressão inteiro aqui dentro (em vez de reusar o CSS do
// app) porque a janela de impressão é um documento HTML totalmente à parte, sem acesso
// aos estilos carregados pelo React.

import { escapeHTML, formatCurrency, formatDate } from "./utils.js";
import { getFinanceMonthKey, formatMonthLabel, inferFinanceCategory, getFinanceFlow, getFinanceStatus, INSTALLMENT_STATUS_LABELS } from "./domain.js";

const PRINT_CONFIG = {
    paper: "A4",
    orientation: "portrait",
    margins: { top: "20px", right: "26px", bottom: "34px", left: "26px" }
};

export function buildPrintDocument(title, subtitle, bodyHtml) {
    const generatedAt = new Date().toLocaleString("pt-BR");

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
        <title>${escapeHTML(title)} — Lemnova</title>
        <style>
            @page {
            size: ${PRINT_CONFIG.paper} ${PRINT_CONFIG.orientation};
            margin:
            ${PRINT_CONFIG.margins.top}
            ${PRINT_CONFIG.margins.right}
            ${PRINT_CONFIG.margins.bottom}
            ${PRINT_CONFIG.margins.left};
}

            * { box-sizing: border-box; }

            html {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
            }

            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }

          body {
    font-family: Aptos, Aptos Display, sans-serif;
    color: #00040c;
    margin: 0;
    padding: 0;
    font-size: 0.86rem;
    line-height: 1.35;
    position: relative;
}

            .watermark {
                position: fixed;
                top: 46%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-28deg);
                font-family: Georgia, serif;
                font-size: 4.4rem;
                font-weight: 700;
                color: rgba(16, 32, 58, 0.045);
                letter-spacing: 0.12em;
                white-space: nowrap;
                z-index: -1;
                pointer-events: none;
            }

            .print-header {
                background: #030c19;
                color: #ffffff;
                margin: 0 -26px 0;
                padding: 8px 26px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .letterhead-rule { margin: 0 -26px 16px; }
            .letterhead-rule .thick { height: 2px; background: #10203a; }
            .letterhead-rule .thin { height: 1px; background: #d4af37; margin-top: 2px; }

            .print-header .brand {
                display: flex;
                align-items: center;
                gap: 9px;
            }

            .print-header .brand-mark {
                width: 26px;
                height: 26px;
                border-radius: 50%;
                background: #d4af37;
                color: #fbfdfe;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 900;
                font-size: 0.78rem;
                letter-spacing: 0.02em;
                flex-shrink: 0;
                font-family: Georgia, serif;
            }

            .print-header .brand-text strong {
                display: block;
                font-size: 0.82rem;
                letter-spacing: 0.06em;
            }

            .print-header .brand-text span {
                display: block;
                font-size: 0.56rem;
                color: #d4af37;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                margin-top: 1px;
            }

            .print-header .doc-meta {
                text-align: right;
                font-size: 0.62rem;
                color: #00050b;
                line-height: 1.4;
            }

            .print-title { margin: 0 0 2px; font-size: 1.18rem; color: #10203a; letter-spacing: 0.01em; }
            .print-subtitle { margin: 0 0 16px; color: #667085; font-size: 0.76rem; font-style: italic; }

            .print-footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: #f0f1f3;
                color: #0a0000;
                border-top: 1px solid #d4af37;
                padding: 7px 26px;
                font-size: 0.68rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
                font-family: Arial, Helvetica, sans-serif;
            }

            .print-footer .footer-right { color: #cbd5e1; }

            table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
            th, td { border: 1px solid #d8dce6; padding: 4px 7px; text-align: left; }
            th { background: #f0f1f5; font-weight: 700; }

            h1, h2, h3 { font-family: Georgia, serif; }
        </style>
        </head><body>
        <div class="watermark">LEMNOVA</div>
        <div class="print-header">
            <div class="brand">
                <div class="brand-mark">LN</div>
                <div class="brand-text">
                    <strong>LEMNOVA</strong>
                    <span>CRM Jurídico</span>
                </div>
            </div>
            <div class="doc-meta">
                <div>${escapeHTML(title)}</div>
                <div>Gerado em ${generatedAt}</div>
            </div>
        </div>
        <div class="letterhead-rule"><div class="thick"></div><div class="thin"></div></div>

        <h1 class="print-title">${escapeHTML(title)}</h1>
        ${subtitle ? `<p class="print-subtitle">${subtitle}</p>` : ""}

        ${bodyHtml}

        <div class="print-footer">
            <span>Lemnova © 2026 • BETA</span>
            <span class="footer-right">Versão 0.2.0 • React • Sistema interno</span>
        </div>
        </body></html>`;
}

// Abre uma nova aba, escreve o documento de impressão e já dispara o print() —
// mesma sequência usada em printCompletedEventsReport/printTasksReport/printTaskReply
// do app original.
export function openPrintWindow(title, subtitle, bodyHtml) {
    const win = window.open("", "_blank");
    if (!win) {
        alert("O navegador bloqueou a abertura da janela de impressão. Permita pop-ups para este site.");
        return;
    }
    win.document.write(buildPrintDocument(title, subtitle, bodyHtml));
    win.document.close();
    win.focus();
    win.print();
}

// Migrado de: printSection() em js/print.js — usado pelo botão 🖨 do topbar quando a
// tela atual não tem um relatório dedicado (ex.: Dashboard, Clientes, Processos):
// imprime o HTML já renderizado da seção, dentro do mesmo timbre dos relatórios.
export function printSection(sectionId, title) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    openPrintWindow(title, "", section.innerHTML);
}

// Migrado de: printTasksReport() em js/tasks.js.
export function printTasksReport(tasks, findClient) {
    const today = new Date().toISOString().slice(0, 10);
    const overdue = tasks.filter((task) => !task.done && task.dueDate && task.dueDate < today);
    const onTime = tasks.filter((task) => !task.done && (!task.dueDate || task.dueDate >= today));
    const done = tasks.filter((task) => task.done);

    const priorityLabels = { low: "Baixa", medium: "Média", high: "Alta" };

    const buildTable = (list, emptyMessage) => {
        if (!list.length) {
            return `<p style="color:#667085;font-size:0.82rem">${emptyMessage}</p>`;
        }
        const rows = list
            .map((task) => {
                const client = findClient(task.clientId);
                const priorityLabel = priorityLabels[task.priority] || task.priority;
                return `
                    <tr>
                        <td>${escapeHTML(task.title)}</td>
                        <td>${escapeHTML(task.responsible || "-")}</td>
                        <td>${client ? escapeHTML(client.name) : "-"}</td>
                        <td>${task.dueDate ? new Date(`${task.dueDate}T00:00:00`).toLocaleDateString("pt-BR") : "Sem prazo"}</td>
                        <td>${escapeHTML(priorityLabel)}</td>
                    </tr>
                `;
            })
            .join("");
        return `
            <table>
                <thead><tr><th>Título</th><th>Responsável</th><th>Cliente</th><th>Prazo</th><th>Prioridade</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    };

    const body = `
        <h2 style="color:#b42318;font-size:1rem;margin:18px 0 8px">Atrasadas (${overdue.length})</h2>
        ${buildTable(overdue, "Nenhuma tarefa atrasada.")}

        <h2 style="color:#b54708;font-size:1rem;margin:18px 0 8px">No prazo (${onTime.length})</h2>
        ${buildTable(onTime, "Nenhuma tarefa em aberto.")}

        <h2 style="color:#027a48;font-size:1rem;margin:18px 0 8px">Concluídas (${done.length})</h2>
        ${buildTable(done, "Nenhuma tarefa concluída.")}
    `;

    openPrintWindow("Relatório de tarefas", "Separado por status: atrasadas, no prazo e concluídas", body);
}

// Migrado de: printCompletedEventsReport() em js/agenda.js.
export function printCompletedEventsReport(events, findClient) {    const completedEvents = [...events]
        .filter((eventItem) => eventItem.done)
        .sort((a, b) => `${a.date}T${a.time || "00:00"}`.localeCompare(`${b.date}T${b.time || "00:00"}`))
        .reverse();

    let body;
    if (!completedEvents.length) {
        body = '<p style="color:#667085">Nenhum evento concluído até o momento.</p>';
    } else {
        const rows = completedEvents
            .map((eventItem) => {
                const client = findClient(eventItem.clientId);
                const eventDate = new Date(`${eventItem.date}T00:00:00`).toLocaleDateString("pt-BR");
                return `
                    <tr>
                        <td>${escapeHTML(eventItem.type)}</td>
                        <td>${client ? escapeHTML(client.name) : "-"}</td>
                        <td>${eventDate} às ${escapeHTML(eventItem.time || "-")}</td>
                        <td>${eventItem.completedAt ? new Date(eventItem.completedAt).toLocaleString("pt-BR") : "-"}</td>
                        <td>${escapeHTML(eventItem.notes || "-")}</td>
                    </tr>
                `;
            })
            .join("");

        body = `
            <table>
                <thead><tr><th>Tipo</th><th>Cliente</th><th>Data/Hora do evento</th><th>Concluído em</th><th>Obs.</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    openPrintWindow("Relatório de eventos concluídos", `${completedEvents.length} evento(s) concluído(s)`, body);
}

// Migrado de: printFinanceReport() em js/finance.js — respeita a busca e o filtro de
// mês já aplicados na tela (o filtro é decidido no componente e passado pronto aqui).
export function printFinanceReport(filteredEntries, { totals, futureTotals, monthLabel, searchTerm, findClient }) {
    const summary = `
        <div class="finance-overview">
            <article class="summary-card">
                <span>Honorários</span>
                <strong>${formatCurrency(totals.fees)}</strong>
                <p>Entradas realizadas</p>
            </article>
            <article class="summary-card">
                <span>Custo de escritório</span>
                <strong>${formatCurrency(totals.officeCosts)}</strong>
                <p>Saídas realizadas</p>
            </article>
            <article class="summary-card">
                <span>Saldo do caixa</span>
                <strong>${formatCurrency(totals.balance)}</strong>
                <p>Realizado até hoje</p>
            </article>
            <article class="summary-card">
                <span>Lançamentos futuros</span>
                <strong>${formatCurrency(futureTotals.balance)}</strong>
                <p>${futureTotals.count} lançamento(s) previsto(s)</p>
            </article>
        </div>
    `;

    let body;
    if (!filteredEntries.length) {
        body = '<p style="color:#667085">Nenhuma movimentação encontrada para os filtros aplicados.</p>';
    } else {
        const monthKeys = [...new Set(filteredEntries.map((entry) => getFinanceMonthKey(entry.date)))].sort((a, b) => b.localeCompare(a));

        const groups = monthKeys
            .map((monthKey) => {
                const entriesOfMonth = filteredEntries
                    .filter((entry) => getFinanceMonthKey(entry.date) === monthKey)
                    .sort((a, b) => b.date.localeCompare(a.date));

                const incomeEntries = entriesOfMonth.filter((entry) => getFinanceFlow(entry) === "Entrada");
                const expenseEntries = entriesOfMonth.filter((entry) => getFinanceFlow(entry) === "Saída");
                const incomeTotal = incomeEntries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
                const expenseTotal = expenseEntries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
                const monthBalance = incomeTotal - expenseTotal;

                const buildRows = (entries) =>
                    entries
                        .map((entry) => {
                            const client = findClient(entry.clientId);
                            return `
                        <tr>
                            <td>${escapeHTML(entry.category || inferFinanceCategory(entry))}</td>
                            <td>${escapeHTML(entry.description)}</td>
                            <td>${client ? escapeHTML(client.name) : "-"}</td>
                            <td>${formatCurrency(entry.amount)}</td>
                            <td>${formatDate(entry.date)}</td>
                            <td>${escapeHTML(getFinanceStatus(entry))}</td>
                        </tr>
                    `;
                        })
                        .join("");

                const buildTable = (title, entries, total, color) => `
                    <p style="margin:8px 0 3px;font-weight:700;color:${color}">${title} (${entries.length}) — ${formatCurrency(total)}</p>
                    <table>
                        <thead><tr><th>Categoria</th><th>Descrição</th><th>Cliente</th><th>Valor</th><th>Data</th><th>Status</th></tr></thead>
                        <tbody>${entries.length ? buildRows(entries) : '<tr><td colspan="6" style="color:#667085">Nenhum lançamento.</td></tr>'}</tbody>
                    </table>
                `;

                return `
                <h3 style="margin:16px 0 2px">${monthKey ? formatMonthLabel(monthKey) : "Sem data"} — Saldo do mês: ${formatCurrency(monthBalance)}</h3>
                ${buildTable("Entradas", incomeEntries, incomeTotal, "#027a48")}
                ${buildTable("Saídas", expenseEntries, expenseTotal, "#b42318")}
            `;
            })
            .join("");

        body = `${summary}${groups}`;
    }

    const subtitleParts = [`Mês: ${escapeHTML(monthLabel)}`];
    if (searchTerm) subtitleParts.push(`Busca: "${escapeHTML(searchTerm)}"`);
    subtitleParts.push(`${filteredEntries.length} lançamento(s)`);

    openPrintWindow("Relatório financeiro", subtitleParts.join(" · "), body);
}

function printPendingReport(entries, title, columns) {
    let body;
    if (!entries.length) {
        body = '<p style="color:#667085">Nenhuma conta em aberto.</p>';
    } else {
        const rows = entries.map((entry) => columns.row(entry)).join("");
        body = `
            <table>
                <thead><tr>${columns.headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }
    openPrintWindow(title, `${entries.length} conta(s) em aberto`, body);
}

// Migrado de: printReceivablesReport() em js/finance.js.
export function printReceivablesReport(receivables, findClient) {
    printPendingReport(receivables, "Contas a receber", {
        headers: ["Cliente", "Categoria", "Descrição", "Valor", "Vencimento"],
        row: (entry) => {
            const client = findClient(entry.clientId);
            return `<tr>
                <td>${client ? escapeHTML(client.name) : "-"}</td>
                <td>${escapeHTML(entry.category || inferFinanceCategory(entry))}</td>
                <td>${escapeHTML(entry.description)}</td>
                <td>${formatCurrency(entry.amount)}</td>
                <td>${formatDate(entry.date)}</td>
            </tr>`;
        }
    });
}

// Migrado de: printPayablesReport() em js/finance.js.
export function printPayablesReport(payables) {
    printPendingReport(payables, "Contas a pagar", {
        headers: ["Fornecedor/Descrição", "Categoria", "Valor", "Vencimento"],
        row: (entry) => `<tr>
            <td>${escapeHTML(entry.description)}</td>
            <td>${escapeHTML(entry.category || inferFinanceCategory(entry))}</td>
            <td>${formatCurrency(entry.amount)}</td>
            <td>${formatDate(entry.date)}</td>
        </tr>`
    });
}

// Migrado de: printCashflowReport() em js/finance.js.
export function printCashflowReport(cashFlowRows) {
    let body;
    if (!cashFlowRows.length) {
        body = '<p style="color:#667085">Nenhuma movimentação cadastrada.</p>';
    } else {
        const tableRows = cashFlowRows
            .map(
                (row) => `
            <tr>
                <td>${formatMonthLabel(row.monthKey)}</td>
                <td>${formatCurrency(row.income)}</td>
                <td>${formatCurrency(row.expense)}</td>
                <td>${formatCurrency(row.monthBalance)}</td>
                <td>${formatCurrency(row.accumulated)}</td>
            </tr>
        `
            )
            .join("");
        body = `
            <table>
                <thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo do mês</th><th>Saldo acumulado</th></tr></thead>
                <tbody>${tableRows}</tbody>
            </table>
        `;
    }
    openPrintWindow("Fluxo de caixa mensal", "", body);
}

// Migrado de: printContractsReport() em js/installments.js.
export function printContractsReport(filteredInstallments, { indicators, monthLabel, statusLabel, searchTerm, clients, findClient }) {
    const summary = `
        <div class="finance-overview">
            <article class="summary-card"><span>Vencidos</span><strong>${indicators.overdue}</strong><p>Parcelas em atraso</p></article>
            <article class="summary-card"><span>Vencendo hoje</span><strong>${indicators.dueToday}</strong><p>Parcelas com vencimento hoje</p></article>
            <article class="summary-card"><span>Receber hoje</span><strong>${indicators.receiveToday}</strong><p>RPVs previstos para hoje</p></article>
            <article class="summary-card"><span>A vencer</span><strong>${indicators.upcoming}</strong><p>Parcelas futuras</p></article>
            <article class="summary-card"><span>Vencido +30 dias</span><strong>${indicators.overdue30}</strong><p>Atraso crítico</p></article>
        </div>
    `;

    let installmentsBody;
    if (!filteredInstallments.length) {
        installmentsBody = '<p style="color:#667085">Nenhuma parcela encontrada para os filtros aplicados.</p>';
    } else {
        const monthKeys = [...new Set(filteredInstallments.map((installment) => getFinanceMonthKey(installment.dueDate)))].sort((a, b) =>
            a.localeCompare(b)
        );

        installmentsBody = monthKeys
            .map((monthKey) => {
                const installmentsOfMonth = filteredInstallments.filter((installment) => getFinanceMonthKey(installment.dueDate) === monthKey);
                const monthTotal = installmentsOfMonth.reduce((sum, installment) => sum + (Number(installment.amount) || 0), 0);

                const rows = installmentsOfMonth
                    .map((installment) => {
                        const client = findClient(installment.clientId);
                        const status = installmentStatusOf(installment);
                        return `
                        <tr>
                            <td>${client ? escapeHTML(client.name) : "Cliente removido"}</td>
                            <td>${client ? escapeHTML(client.benefit || "-") : "-"}</td>
                            <td>${installment.total ? `${installment.number}/${installment.total}` : "Avulsa"}</td>
                            <td>${formatCurrency(installment.amount)}</td>
                            <td>${formatDate(installment.dueDate)}</td>
                            <td>${escapeHTML(INSTALLMENT_STATUS_LABELS[status])}</td>
                        </tr>
                    `;
                    })
                    .join("");

                return `
                <h3 style="margin:14px 0 4px">${monthKey ? formatMonthLabel(monthKey) : "Sem vencimento"} — Total: ${formatCurrency(monthTotal)}</h3>
                <table>
                    <thead><tr><th>Cliente</th><th>Benefício</th><th>Parcela</th><th>Valor</th><th>Vencimento</th><th>Status</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
            })
            .join("");
    }

    const rpvClients = clients.filter((client) => Number(client.rpvValue) > 0);
    let rpvBody = "";
    if (rpvClients.length) {
        const today = new Date().toISOString().slice(0, 10);
        const rpvRows = rpvClients
            .map((client) => {
                const active = client.administrativeStatus === "Indeferido";
                const isToday = active && client.rpvDate === today && !client.rpvReceived;
                const statusLbl = !active ? "Aguardando indeferimento" : client.rpvReceived ? "Recebido" : isToday ? "Receber hoje" : "Aguardando";
                return `
                <tr>
                    <td>${escapeHTML(client.name)}</td>
                    <td>${escapeHTML(client.administrativeStatus || "Em andamento")}</td>
                    <td>${formatCurrency(client.rpvValue)}</td>
                    <td>${client.rpvDate ? formatDate(client.rpvDate) : "Sem previsão"}</td>
                    <td>${escapeHTML(statusLbl)}</td>
                </tr>
            `;
            })
            .join("");

        rpvBody = `
            <h3 style="margin:18px 0 4px">RPVs (só entram em vigor quando o administrativo é indeferido)</h3>
            <table>
                <thead><tr><th>Cliente</th><th>Administrativo</th><th>Valor do RPV</th><th>Previsão</th><th>Status</th></tr></thead>
                <tbody>${rpvRows}</tbody>
            </table>
        `;
    }

    const subtitleParts = [`Mês: ${escapeHTML(monthLabel)}`, `Status: ${escapeHTML(statusLabel)}`];
    if (searchTerm) subtitleParts.push(`Busca: "${escapeHTML(searchTerm)}"`);
    subtitleParts.push(`${filteredInstallments.length} parcela(s)`);

    openPrintWindow("Relatório de contratos", subtitleParts.join(" · "), `${summary}${installmentsBody}${rpvBody}`);
}

// Cópia local mínima de getInstallmentStatus (evita importar domain.js inteiro aqui só
// por causa de uma função — o cálculo em si é o mesmo de services/domain.js).
function installmentStatusOf(installment) {
    if (installment.paid) return "paid";
    const today = new Date().toISOString().slice(0, 10);
    const diff = Math.round((new Date(`${today}T00:00:00Z`) - new Date(`${installment.dueDate}T00:00:00Z`)) / 86400000);
    if (diff > 30) return "overdue30";
    if (diff > 0) return "overdue";
    if (diff === 0) return "today";
    return "upcoming";
}
