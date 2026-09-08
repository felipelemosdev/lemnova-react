// src/services/api.js
//
// Camada de acesso a dados do Lemnova.
//
// HOJE: cada função aqui lê/grava no IndexedDB local (via storage.js), exatamente como
// o app fazia em JS puro.
//
// NO FUTURO (quando o backend existir): a ideia é que só ESTE arquivo precise mudar.
// Em vez de `readStorage(...)` / `saveStorage(...)`, essas funções vão virar chamadas
// `fetch("/api/clientes")`, `fetch("/api/clientes", { method: "POST", ... })` etc.
// Nenhum componente React (páginas, Dashboard, formulários) precisa saber a diferença —
// eles só chamam `api.getClientes()`, `api.criarCliente()` e por aí vai.
//
// Por isso: NUNCA importe storage.js diretamente dentro de um componente ou página.
// Sempre passe por aqui.

import { STORAGE_KEYS, readStorage, saveStorage, removeStorage, initializeDatabase, migrateLegacyStorage, getStorageModeLabel } from "./storage.js";
import { createId } from "./utils.js";
import { generateInstallmentsForClient, hasInstallments } from "./domain.js";

// --------------------------------------------------------------------------
// Boot / infraestrutura
// --------------------------------------------------------------------------

export async function initDatabase() {
    await initializeDatabase();
    await migrateLegacyStorage();
}

export { getStorageModeLabel };

// --------------------------------------------------------------------------
// Sessão / autenticação
// --------------------------------------------------------------------------
// ATENÇÃO: login "admin"/"1234" fixo no código, igual ao app original — é só um placeholder
// até existir autenticação real no backend (Node + PostgreSQL, JWT, etc). Não é seguro.

export async function getSession() {
    return readStorage(STORAGE_KEYS.session, null);
}

export async function login(user, password) {
    if (user !== "admin" || password !== "1234") {
        throw new Error("Usuário ou senha inválidos.");
    }
    const session = { user, loggedAt: new Date().toISOString() };
    await saveStorage(STORAGE_KEYS.session, session);
    return session;
}

export async function logout() {
    await removeStorage(STORAGE_KEYS.session);
}

// --------------------------------------------------------------------------
// Coleções principais (todas seguem o mesmo padrão: list / create / update / remove)
// --------------------------------------------------------------------------

async function listCollection(key) {
    return readStorage(key, []);
}

async function saveCollection(key, records) {
    await saveStorage(key, records);
    return records;
}

function makeCrud(storageKey) {
    return {
        list: () => listCollection(storageKey),

        async create(record) {
            const list = await listCollection(storageKey);
            const newRecord = { id: createId(), createdAt: new Date().toISOString(), ...record };
            await saveCollection(storageKey, [newRecord, ...list]);
            return newRecord;
        },

        async update(id, changes) {
            const list = await listCollection(storageKey);
            const updated = list.map((item) =>
                item.id === id ? { ...item, ...changes, updatedAt: new Date().toISOString() } : item
            );
            await saveCollection(storageKey, updated);
            return updated.find((item) => item.id === id);
        },

        async remove(id) {
            const list = await listCollection(storageKey);
            await saveCollection(storageKey, list.filter((item) => item.id !== id));
        },

        // Substitui a coleção inteira de uma vez (útil quando a lógica de negócio já
        // calculou a lista nova inteira, como acontece hoje em finance.js/installments.js).
        replaceAll: (records) => saveCollection(storageKey, records)
    };
}

export const clientsApi = makeCrud(STORAGE_KEYS.clients);
export const documentsApi = makeCrud(STORAGE_KEYS.documents);
export const financeApi = makeCrud(STORAGE_KEYS.finance);
export const eventsApi = makeCrud(STORAGE_KEYS.events);
export const tasksApi = makeCrud(STORAGE_KEYS.tasks);
export const installmentsApi = makeCrud(STORAGE_KEYS.installments);

// Excluir um cliente também "desvincula" (não apaga) os processos e lançamentos
// financeiros que apontavam pra ele, e remove as parcelas de contrato associadas —
// mesma cascata de confirmClientDelete() em js/clients.js.
export async function deleteClientCascade(clientId) {
    const [clients, documents, finance, installments] = await Promise.all([
        listCollection(STORAGE_KEYS.clients),
        listCollection(STORAGE_KEYS.documents),
        listCollection(STORAGE_KEYS.finance),
        listCollection(STORAGE_KEYS.installments)
    ]);

    await Promise.all([
        saveCollection(STORAGE_KEYS.clients, clients.filter((client) => client.id !== clientId)),
        saveCollection(
            STORAGE_KEYS.documents,
            documents.map((doc) => (doc.clientId === clientId ? { ...doc, clientId: "" } : doc))
        ),
        saveCollection(
            STORAGE_KEYS.finance,
            finance.map((entry) => (entry.clientId === clientId ? { ...entry, clientId: "" } : entry))
        ),
        saveCollection(
            STORAGE_KEYS.installments,
            installments.filter((installment) => installment.clientId !== clientId)
        )
    ]);
}

// Atalhos no "formato que o Felipe pediu no briefing" (api.getClientes(), etc.),
// só delegando para os CRUDs acima — fica mais natural de ler nas páginas.
export const api = {
    getClientes: clientsApi.list,
    criarCliente: clientsApi.create,
    atualizarCliente: clientsApi.update,
    deletarCliente: clientsApi.remove,

    getDocumentos: documentsApi.list,
    getFinanceiro: financeApi.list,
    getEventos: eventsApi.list,
    getTarefas: tasksApi.list,
    getParcelas: installmentsApi.list
};

// --------------------------------------------------------------------------
// Financeiro ↔ Parcelas de contrato (Contratos): sincronização bidirecional.
//
// Migrado de: upsertInstallmentFinanceEntry/setInstallmentPaid/syncInstallmentFromFinanceEntry
// /maybeGenerateInstallmentsOnActivation/removeInstallmentFinanceEntry de js/installments.js.
//
// Toda parcela de contrato tem um lançamento "espelho" no Financeiro (Entrada · Parcela).
// É esse espelho que faz a parcela aparecer em "Contas a Receber" assim que o contrato é
// ativado, e some de lá quando o recebimento é confirmado — dos dois lados (tela de
// Contratos OU tela Financeiro), sem duplicar o dado.
// --------------------------------------------------------------------------

// Cria ou atualiza (mantendo o mesmo id) o lançamento espelhado de uma parcela.
async function upsertInstallmentFinanceEntry(financeList, installment, status, client) {
    const financeEntryId = installment.financeEntryId || createId();
    const financeEntry = {
        id: financeEntryId,
        type: "Entrada",
        category: "Parcela",
        status,
        contractType: "",
        amount: Number(installment.amount) || 0,
        date: installment.dueDate,
        clientId: installment.clientId,
        description: installment.total
            ? `Parcela ${installment.number}/${installment.total}${client ? " — " + client.name : ""}`
            : `Parcela avulsa${client ? " — " + client.name : ""}`,
        createdAt: new Date().toISOString()
    };

    return {
        financeEntryId,
        financeList: [financeEntry, ...financeList.filter((entry) => entry.id !== financeEntryId)]
    };
}

// Chamado pela tela de Clientes logo após salvar o cadastro. Só gera parcelas quando o
// status vira "Ativo" pela primeira vez (transição) e o contrato ainda não tem vencimentos.
// Cada parcela já entra imediatamente como Conta a Receber (situação "Pendente").
export async function generateInstallmentsIfNeeded(client, previousStatus) {
    const justActivated = client.status === "Ativo" && previousStatus !== "Ativo";
    if (!justActivated) return;

    const [installments, finance] = await Promise.all([
        listCollection(STORAGE_KEYS.installments),
        listCollection(STORAGE_KEYS.finance)
    ]);

    if (hasInstallments(installments, client.id)) return;

    const generated = generateInstallmentsForClient(client);
    if (!generated.length) return;

    let financeList = finance;
    const withFinanceIds = [];
    for (const installment of generated) {
        const result = await upsertInstallmentFinanceEntry(financeList, installment, "Pendente", client);
        financeList = result.financeList;
        withFinanceIds.push({ ...installment, financeEntryId: result.financeEntryId });
    }

    await Promise.all([
        saveCollection(STORAGE_KEYS.installments, [...withFinanceIds, ...installments]),
        saveCollection(STORAGE_KEYS.finance, financeList)
    ]);
}

// Marca a parcela como paga/recebida (ou desfaz) e atualiza a situação do lançamento
// espelhado no Financeiro. Ao desfazer, o lançamento não é apagado, só volta para
// "Pendente" (reaparece em Contas a Receber).
export async function setInstallmentPaid(installmentId, paid) {
    const [installments, finance, clients] = await Promise.all([
        listCollection(STORAGE_KEYS.installments),
        listCollection(STORAGE_KEYS.finance),
        listCollection(STORAGE_KEYS.clients)
    ]);

    const installment = installments.find((item) => item.id === installmentId);
    if (!installment) return;

    const client = clients.find((c) => c.id === installment.clientId);
    const { financeEntryId, financeList } = await upsertInstallmentFinanceEntry(
        finance,
        installment,
        paid ? "Recebido" : "Pendente",
        client
    );

    const updatedInstallments = installments.map((item) =>
        item.id === installmentId ? { ...item, paid, paidAt: paid ? new Date().toISOString() : null, financeEntryId } : item
    );

    await Promise.all([
        saveCollection(STORAGE_KEYS.installments, updatedInstallments),
        saveCollection(STORAGE_KEYS.finance, financeList)
    ]);
}

// Usado quando o recebimento de uma parcela é confirmado pela tela Financeiro (Contas a
// Receber) em vez da tela Contratos — mantém os dois lados em sincronia.
export async function syncInstallmentFromFinanceEntry(financeEntryId, paid) {
    const installments = await listCollection(STORAGE_KEYS.installments);
    const installment = installments.find((item) => item.financeEntryId === financeEntryId);
    if (!installment) return;

    const updated = installments.map((item) =>
        item.id === installment.id ? { ...item, paid, paidAt: paid ? new Date().toISOString() : null } : item
    );
    await saveCollection(STORAGE_KEYS.installments, updated);
}

// Migrado de: markFinanceStatus() em js/finance.js — marca um lançamento do Financeiro
// como Recebido/Pago e, se ele for o espelho de uma parcela de contrato, sincroniza a
// aba Contratos também.
export async function markFinanceStatus(entryId, newStatus) {
    const finance = await listCollection(STORAGE_KEYS.finance);
    const updated = finance.map((entry) =>
        entry.id === entryId ? { ...entry, status: newStatus, settledAt: new Date().toISOString() } : entry
    );
    await saveCollection(STORAGE_KEYS.finance, updated);
    await syncInstallmentFromFinanceEntry(entryId, newStatus === "Recebido" || newStatus === "Pago");
}

// Migrado de: handleFinanceSubmit() (modo edição) em js/finance.js — editar um lançamento
// existente também sincroniza a parcela espelhada, caso a Situação tenha mudado.
export async function updateFinanceEntry(entryId, changes) {
    await financeApi.update(entryId, changes);
    await syncInstallmentFromFinanceEntry(entryId, changes.status === "Recebido" || changes.status === "Pago");
}

// Migrado de: confirmInstallmentDelete() — excluir uma parcela também remove o
// lançamento espelhado no Financeiro (se existir).
export async function deleteInstallmentCascade(installmentId) {
    const [installments, finance] = await Promise.all([
        listCollection(STORAGE_KEYS.installments),
        listCollection(STORAGE_KEYS.finance)
    ]);

    const installment = installments.find((item) => item.id === installmentId);
    const financeList = installment?.financeEntryId
        ? finance.filter((entry) => entry.id !== installment.financeEntryId)
        : finance;

    await Promise.all([
        saveCollection(STORAGE_KEYS.installments, installments.filter((item) => item.id !== installmentId)),
        saveCollection(STORAGE_KEYS.finance, financeList)
    ]);
}

// Migrado de: handleInstallmentModalSave() (criação) — parcela avulsa criada manualmente
// pela tela de Contratos, fora do parcelamento automático do contrato.
export async function createManualInstallment({ clientId, amount, dueDate }) {
    const [installments, finance, clients] = await Promise.all([
        listCollection(STORAGE_KEYS.installments),
        listCollection(STORAGE_KEYS.finance),
        listCollection(STORAGE_KEYS.clients)
    ]);

    const client = clients.find((c) => c.id === clientId);
    const newInstallment = {
        id: createId(),
        clientId,
        number: installments.filter((item) => item.clientId === clientId).length + 1,
        total: null, // parcela avulsa, fora do parcelamento automático
        amount,
        dueDate,
        paid: false,
        paidAt: null,
        createdAt: new Date().toISOString()
    };

    const { financeEntryId, financeList } = await upsertInstallmentFinanceEntry(finance, newInstallment, "Pendente", client);

    await Promise.all([
        saveCollection(STORAGE_KEYS.installments, [{ ...newInstallment, financeEntryId }, ...installments]),
        saveCollection(STORAGE_KEYS.finance, financeList)
    ]);
}

// Migrado de: handleInstallmentModalSave() (edição) — só altera valor/vencimento; o
// vínculo com cliente/número de parcela não muda.
export async function updateInstallmentAmountAndDate(installmentId, { amount, dueDate }) {
    const [installments, finance, clients] = await Promise.all([
        listCollection(STORAGE_KEYS.installments),
        listCollection(STORAGE_KEYS.finance),
        listCollection(STORAGE_KEYS.clients)
    ]);

    const current = installments.find((item) => item.id === installmentId);
    if (!current) return;

    const updated = { ...current, amount, dueDate, updatedAt: new Date().toISOString() };
    const client = clients.find((c) => c.id === updated.clientId);
    const { financeEntryId, financeList } = await upsertInstallmentFinanceEntry(
        finance,
        updated,
        updated.paid ? "Recebido" : "Pendente",
        client
    );

    await Promise.all([
        saveCollection(
            STORAGE_KEYS.installments,
            installments.map((item) => (item.id === installmentId ? { ...updated, financeEntryId } : item))
        ),
        saveCollection(STORAGE_KEYS.finance, financeList)
    ]);
}

// --------------------------------------------------------------------------
// RPV (dentro do cadastro do cliente)
// --------------------------------------------------------------------------

export async function toggleRpvReceived(clientId) {
    const clients = await listCollection(STORAGE_KEYS.clients);
    const updated = clients.map((client) =>
        client.id === clientId
            ? { ...client, rpvReceived: !client.rpvReceived, rpvReceivedAt: client.rpvReceived ? null : new Date().toISOString() }
            : client
    );
    await saveCollection(STORAGE_KEYS.clients, updated);
}

export async function clearClientRpv(clientId) {
    const clients = await listCollection(STORAGE_KEYS.clients);
    const updated = clients.map((client) =>
        client.id === clientId ? { ...client, rpvValue: 0, rpvDate: "", rpvReceived: false, rpvReceivedAt: null } : client
    );
    await saveCollection(STORAGE_KEYS.clients, updated);
}
