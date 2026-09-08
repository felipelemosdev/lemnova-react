// src/context/AppContext.jsx
//
// Substitui o antigo `appState` global (js/state.js) por um Context do React.
//
// Qualquer componente pode ler os dados com `useApp()`:
//     const { clients, documents, finance, events, tasks, installments, loading } = useApp();
//
// E qualquer componente pode disparar uma releitura depois de criar/editar/excluir algo:
//     const { refresh } = useApp();
//     await clientsApi.create(novoCliente);
//     await refresh(); // recarrega tudo do storage e atualiza a tela
//
// Isso é propositalmente simples (sem Redux/Zustand) porque o volume de dados é pequeno
// (tudo local, um escritório só). Quando o backend existir, dá pra trocar por
// React Query/SWR aqui dentro sem mudar nada nas páginas.

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
    initDatabase,
    getSession,
    login as apiLogin,
    logout as apiLogout,
    clientsApi,
    documentsApi,
    financeApi,
    eventsApi,
    tasksApi,
    installmentsApi,
    deleteClientCascade
} from "../services/api.js";
import { createId } from "../services/utils.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [booting, setBooting] = useState(true);
    const [session, setSession] = useState(null);

    const [clients, setClients] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [finance, setFinance] = useState([]);
    const [events, setEvents] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [installments, setInstallments] = useState([]);

    // Qual tarefa está com a "conversa" (chat interno) aberta. Fica aqui no Context (e
    // não como estado local da página de Tarefas) porque o botão 💬 do topbar também
    // precisa conseguir abrir essa conversa de qualquer tela do sistema — ver
    // components/TaskReplyModal.jsx, montado uma vez no Layout.
    const [activeReplyTaskId, setActiveReplyTaskId] = useState(null);

    const refresh = useCallback(async () => {
        const [clientsList, documentsList, financeList, eventsList, tasksList, installmentsList] = await Promise.all([
            clientsApi.list(),
            documentsApi.list(),
            financeApi.list(),
            eventsApi.list(),
            tasksApi.list(),
            installmentsApi.list()
        ]);
        setClients(clientsList);
        setDocuments(documentsList);
        setFinance(financeList);
        setEvents(eventsList);
        setTasks(tasksList);
        setInstallments(installmentsList);
    }, []);

    // Boot: abre o IndexedDB, migra dados legados do localStorage (se houver) e
    // restaura a sessão salva — exatamente o que hydrateSession() fazia no app original.
    useEffect(() => {
        (async () => {
            await initDatabase();
            const savedSession = await getSession();
            setSession(savedSession);
            await refresh();
            setBooting(false);
        })();
    }, [refresh]);

    const login = useCallback(async (user, password) => {
        const newSession = await apiLogin(user, password);
        setSession(newSession);
        return newSession;
    }, []);

    const logout = useCallback(async () => {
        await apiLogout();
        setSession(null);
    }, []);

    const findClient = useCallback(
        (clientId) => clients.find((client) => client.id === clientId),
        [clients]
    );

    // Exclusão de cliente é usada em vários lugares (cadastro, listas de clientes,
    // futuramente Processos/Financeiro), por isso mora no Context em vez de duplicar
    // a chamada + refresh() em cada tela.
    const deleteClient = useCallback(
        async (clientId) => {
            await deleteClientCascade(clientId);
            await refresh();
        },
        [refresh]
    );

    // ---- Tarefas / conversa interna ---------------------------------------------
    // Migrado de: openTaskReply/closeTaskReply/saveTaskReply/completeTaskFromReply de
    // js/tasks.js. Mora no Context pelo mesmo motivo de activeReplyTaskId acima.

    const openTaskReply = useCallback(
        async (taskId) => {
            setActiveReplyTaskId(taskId);
            const task = tasks.find((t) => t.id === taskId);
            if (task?.unreadCount) {
                await tasksApi.update(taskId, { unreadCount: 0 });
                await refresh();
            }
        },
        [tasks, refresh]
    );

    const closeTaskReply = useCallback(() => setActiveReplyTaskId(null), []);

    const appendTaskReply = useCallback(
        async (taskId, { author, role, text, pdfData, pdfName }) => {
            const task = tasks.find((t) => t.id === taskId);
            if (!task) return;

            const reply = {
                id: createId(),
                author: author || "Anônimo",
                role: role || "to",
                text,
                pdfData: pdfData || "",
                pdfName: pdfName || "",
                createdAt: new Date().toISOString()
            };

            await tasksApi.update(taskId, { replies: [...(task.replies || []), reply] });
            await refresh();
        },
        [tasks, refresh]
    );

    const toggleTaskDone = useCallback(
        async (taskId) => {
            const task = tasks.find((t) => t.id === taskId);
            if (!task) return;
            await tasksApi.update(taskId, { done: !task.done });
            await refresh();
        },
        [tasks, refresh]
    );

    const completeTask = useCallback(
        async (taskId) => {
            await tasksApi.update(taskId, { done: true });
            await refresh();
        },
        [refresh]
    );

    const deleteTask = useCallback(
        async (taskId) => {
            await tasksApi.remove(taskId);
            if (activeReplyTaskId === taskId) {
                setActiveReplyTaskId(null);
            }
            await refresh();
        },
        [refresh, activeReplyTaskId]
    );

    const value = useMemo(
        () => ({
            booting,
            session,
            login,
            logout,
            clients,
            documents,
            finance,
            events,
            tasks,
            installments,
            findClient,
            deleteClient,
            activeReplyTaskId,
            openTaskReply,
            closeTaskReply,
            appendTaskReply,
            toggleTaskDone,
            completeTask,
            deleteTask,
            refresh
        }),
        [
            booting,
            session,
            login,
            logout,
            clients,
            documents,
            finance,
            events,
            tasks,
            installments,
            findClient,
            deleteClient,
            activeReplyTaskId,
            openTaskReply,
            closeTaskReply,
            appendTaskReply,
            toggleTaskDone,
            completeTask,
            deleteTask,
            refresh
        ]
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) {
        throw new Error("useApp precisa ser usado dentro de <AppProvider>");
    }
    return ctx;
}
