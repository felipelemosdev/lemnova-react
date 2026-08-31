// src/services/domain.js
//
// Regras de negócio "puras" do Lemnova: nada aqui toca no DOM nem em storage.
// São as mesmas contas que existiam em finance.js / installments.js / agenda.js no
// projeto original, só que em vez de lerem de `appState` (uma variável global), elas
// recebem os dados como parâmetro. Isso facilita usar a mesma lógica em qualquer
// componente React, sem repetir cálculo.
//
// Conforme migrarmos Financeiro, Contratos e Agenda, essas funções vão crescer.

import { todayISO, diffDaysISO, addMonthsISO, createId } from "./utils.js";

const OVERDUE_30_DAYS_THRESHOLD = 30;

// ---- Financeiro -----------------------------------------------------------

export function getFinanceFlow(entry) {
    if (entry.type === "Saída" || entry.type === "Pagamento") {
        return "Saída";
    }
    return "Entrada";
}

export function getFinanceStatus(entry) {
    if (entry.status) {
        return entry.status;
    }
    const isFuture = entry.date > todayISO();
    if (isFuture) {
        return "Pendente";
    }
    return getFinanceFlow(entry) === "Entrada" ? "Recebido" : "Pago";
}

export function calculateFinanceTotals(financeEntries) {
    return financeEntries
        .filter((entry) => {
            const status = getFinanceStatus(entry);
            return status !== "Pendente" && status !== "Cancelado";
        })
        .reduce(
            (totals, entry) => {
                const flow = getFinanceFlow(entry);
                const amount = Number(entry.amount) || 0;

                if (flow === "Entrada") {
                    totals.fees += amount;
                    totals.entries += amount;
                    totals.balance += amount;
                }
                if (flow === "Saída") {
                    totals.officeCosts += amount;
                    totals.exits += amount;
                    totals.balance -= amount;
                }
                return totals;
            },
            { fees: 0, officeCosts: 0, entries: 0, exits: 0, balance: 0 }
        );
}

export function calculateFutureFinanceTotals(financeEntries) {
    const pendingEntries = financeEntries.filter((entry) => getFinanceStatus(entry) === "Pendente");
    const balance = pendingEntries.reduce(
        (total, entry) => total + (getFinanceFlow(entry) === "Entrada" ? Number(entry.amount) || 0 : -(Number(entry.amount) || 0)),
        0
    );
    return { balance, count: pendingEntries.length };
}

export function getFinanceMonthKey(dateISO) {
    return dateISO ? dateISO.slice(0, 7) : ""; // "YYYY-MM"
}

export function formatMonthLabel(monthKey) {
    const [year, month] = monthKey.split("-").map(Number);
    const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(Date.UTC(year, month - 1, 1)));
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export function inferFinanceCategory(entry) {
    if (entry.category) return entry.category;
    if (entry.type === "Honorários") return "Honorário";
    if (entry.type === "Pagamento") return "Custo de escritório";
    return "Recebimento";
}

function getPendingEntries(financeEntries, flow) {
    return financeEntries
        .filter((entry) => getFinanceFlow(entry) === flow && getFinanceStatus(entry) === "Pendente")
        .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
}

export function getReceivables(financeEntries) {
    return getPendingEntries(financeEntries, "Entrada");
}

export function getPayables(financeEntries) {
    return getPendingEntries(financeEntries, "Saída");
}

// Resumo mensal (Entradas x Saídas x Saldo do mês x Saldo acumulado), do mês mais
// antigo pro mais recente/futuro — reflete o caixa projetado.
export function calculateCashFlowByMonth(financeEntries) {
    const monthKeys = [...new Set(financeEntries.map((entry) => getFinanceMonthKey(entry.date)).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
    );

    let accumulated = 0;
    return monthKeys.map((monthKey) => {
        const entriesOfMonth = financeEntries.filter((entry) => getFinanceMonthKey(entry.date) === monthKey);
        const income = entriesOfMonth.filter((entry) => getFinanceFlow(entry) === "Entrada").reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
        const expense = entriesOfMonth.filter((entry) => getFinanceFlow(entry) === "Saída").reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
        const monthBalance = income - expense;
        accumulated += monthBalance;
        return { monthKey, income, expense, monthBalance, accumulated };
    });
}

// ---- Parcelas / Contratos ---------------------------------------------------

export function getInstallmentStatus(installment) {
    if (installment.paid) {
        return "paid";
    }
    const diff = diffDaysISO(todayISO(), installment.dueDate);
    if (diff > OVERDUE_30_DAYS_THRESHOLD) return "overdue30";
    if (diff > 0) return "overdue";
    if (diff === 0) return "today";
    return "upcoming";
}

export const INSTALLMENT_STATUS_LABELS = {
    paid: "Paga",
    overdue30: "Vencido +30 dias",
    overdue: "Vencido",
    today: "Vence hoje",
    upcoming: "A vencer"
};

// Reaproveita classes de pílula já existentes no CSS (task-pill high/medium/low).
export const INSTALLMENT_STATUS_PILL_CLASS = {
    paid: "low",
    overdue30: "high",
    overdue: "high",
    today: "medium",
    upcoming: "low"
};

export function calculatePendingInstallmentsSummary(installments) {
    const pending = installments.filter((installment) => !installment.paid);
    const total = pending.reduce((sum, installment) => sum + (Number(installment.amount) || 0), 0);
    const overdueTotal = pending
        .filter((installment) => ["overdue", "overdue30"].includes(getInstallmentStatus(installment)))
        .reduce((sum, installment) => sum + (Number(installment.amount) || 0), 0);

    return { total, count: pending.length, overdueTotal, upcomingTotal: total - overdueTotal };
}

export function calculateContractIndicators(installments, clients) {
    const pending = installments.filter((installment) => !installment.paid);

    const overdue = pending.filter((i) => ["overdue", "overdue30"].includes(getInstallmentStatus(i))).length;
    const overdue30 = pending.filter((i) => getInstallmentStatus(i) === "overdue30").length;
    const dueToday = pending.filter((i) => getInstallmentStatus(i) === "today").length;
    const upcoming = pending.filter((i) => getInstallmentStatus(i) === "upcoming").length;

    const today = todayISO();
    // O RPV só "existe" de verdade (conta como pendência a receber) quando o
    // administrativo foi indeferido — antes disso é só uma previsão, o caso ainda pode
    // ser resolvido sem ir à Justiça. Ver ADMINISTRATIVE_STATUS_OPTIONS em
    // components/clients/ClientForm.jsx.
    const receiveToday = clients.filter(
        (client) =>
            client.administrativeStatus === "Indeferido" &&
            client.rpvValue &&
            Number(client.rpvValue) > 0 &&
            client.rpvDate === today &&
            !client.rpvReceived
    ).length;

    return { overdue, dueToday, receiveToday, upcoming, overdue30 };
}

export function getInstallmentsAwaitingConfirmation(installments) {
    const today = todayISO();
    return installments
        .filter((installment) => !installment.paid && installment.dueDate && installment.dueDate <= today)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function hasInstallments(installments, clientId) {
    return installments.some((installment) => installment.clientId === clientId);
}

// O RPV (30% sobre o valor recebido na via judicial, referente ao tempo de espera) só
// entra em vigor quando o pedido administrativo é indeferido — antes disso o caso ainda
// pode ser resolvido pela via administrativa, sem ir à Justiça.
export const ADMINISTRATIVE_STATUS_OPTIONS = ["Em andamento", "Deferido", "Indeferido"];

export function isRpvActive(client) {
    return client.administrativeStatus === "Indeferido";
}

// Gera as parcelas mensais de um contrato (função pura — quem grava no storage e cria os
// lançamentos espelhados no Financeiro é generateInstallmentsIfNeeded em services/api.js).
// A 1ª parcela vence na "Data do 1º pagamento" do cadastro; se não informada, cai no
// comportamento antigo (1 mês a partir de hoje). As demais seguem no mesmo dia dos meses
// seguintes (ex.: 01/08, 01/09, 01/10...).
export function generateInstallmentsForClient(client) {
    const total = Number(client.contractValue) || 0;
    const count = Math.max(0, Math.floor(Number(client.installmentsCount) || 0));

    if (!total || !count) {
        return [];
    }

    const baseAmount = Math.floor((total / count) * 100) / 100;
    const roundingAdjustment = Math.round((total - baseAmount * count) * 100) / 100;
    const firstPaymentDate = client.firstPaymentDate || addMonthsISO(todayISO(), 1);

    const newInstallments = [];
    for (let index = 0; index < count; index += 1) {
        const isLast = index === count - 1;
        newInstallments.push({
            id: createId(),
            clientId: client.id,
            number: index + 1,
            total: count,
            amount: isLast ? Math.round((baseAmount + roundingAdjustment) * 100) / 100 : baseAmount,
            dueDate: addMonthsISO(firstPaymentDate, index),
            paid: false,
            paidAt: null,
            createdAt: new Date().toISOString()
        });
    }

    return newInstallments;
}

// ---- Agenda -----------------------------------------------------------------

export function getSortedEvents(events, { includeDone = false } = {}) {
    const source = includeDone ? events : events.filter((eventItem) => !eventItem.done);
    return [...source].sort((a, b) =>
        `${a.date || ""}T${a.time || "00:00"}`.localeCompare(`${b.date || ""}T${b.time || "00:00"}`)
    );
}

// ---- Tarefas ------------------------------------------------------------------

export function splitTasksByDueDate(tasks) {
    const today = todayISO();
    return {
        overdue: tasks.filter((t) => !t.done && t.dueDate && t.dueDate < today),
        today: tasks.filter((t) => !t.done && t.dueDate === today),
        upcoming: tasks.filter((t) => !t.done && t.dueDate && t.dueDate > today),
        done: tasks.filter((t) => t.done)
    };
}

// ---- Fluxo do processo (Cadastro → ... → Finalizado) -------------------------
//
// Migrado do documento "Atualização do Fluxo de Cliente e Contrato — Lemnova".
// Etapa do processo é INDEPENDENTE de `client.status` (situação geral do cadastro) e de
// `client.administrativeStatus` (resultado do benefício) — nunca misturar os três. Cada
// mudança de etapa deve ser registrada em `stageHistoryApi` (services/api.js), nunca só
// sobrescrita no cliente.

export const PROCESS_STAGES = [
    "Cadastro",
    "Documentação pendente",
    "Documentação completa",
    "Protocolo realizado",
    "Aguardando avaliação social",
    "Avaliação social realizada",
    "Aguardando perícia médica",
    "Perícia médica realizada",
    "Aguardando resultado",
    "Deferido",
    "Cobrança administrativa",
    "Indeferido",
    "Em cálculo de RPV",
    "Cobrança RPV",
    "Finalizado"
];

export const DEFAULT_PROCESS_STAGE = PROCESS_STAGES[0];

export function getProcessStageIndex(stage) {
    const index = PROCESS_STAGES.indexOf(stage);
    return index === -1 ? 0 : index;
}

// A partir de "Aguardando resultado" o fluxo se bifurca (Deferido x Indeferido), então
// não existe um "próximo" único — quem decide pra qual lado ir é a tela (resultado do
// benefício), não esse helper.
export const STAGE_BRANCH_POINT = "Aguardando resultado";

export function getNextLinearStage(stage) {
    const index = getProcessStageIndex(stage);
    if (PROCESS_STAGES[index] === STAGE_BRANCH_POINT) return null;
    return PROCESS_STAGES[index + 1] || null;
}

// ---- Clientes -----------------------------------------------------------------

// Mesmas 5 opções de ordenação/filtro de js/clients.js (usadas no cadastro de
// clientes e reaproveitadas para imprimir a lista na mesma ordem exibida em tela).
export function sortClients(clients, order) {
    const sorted = [...clients];
    const byName = (a, b) => (a.name || "").localeCompare(b.name || "", "pt-BR", { sensitivity: "base" });

    switch (order) {
        case "name-desc":
            return sorted.sort((a, b) => byName(b, a));
        case "recent":
            return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        case "oldest":
            return sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        case "status":
            return sorted.sort((a, b) => {
                const statusCompare = (a.status || "").localeCompare(b.status || "", "pt-BR", { sensitivity: "base" });
                return statusCompare !== 0 ? statusCompare : byName(a, b);
            });
        case "name-asc":
        default:
            return sorted.sort(byName);
    }
}
