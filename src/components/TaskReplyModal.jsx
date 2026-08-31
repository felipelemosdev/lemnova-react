// src/components/TaskReplyModal.jsx
// Migrado de: <div id="taskReplyOverlay"> em index.html + openTaskReply/closeTaskReply/
// renderReplyHistory/setupChatRoleButtons/selectChatRole/saveTaskReply/printTaskReply/
// completeTaskFromReply de js/tasks.js.
//
// Montado uma única vez no Layout (como a Justitia): tanto o botão 💬 do topbar quanto
// o botão "Conversa" da lista de tarefas abrem esta mesma conversa, através de
// activeReplyTaskId no AppContext.

import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { getInitials, fileToDataURL, isAllowedPdf, escapeHTML } from "../services/utils.js";
import { openPrintWindow } from "../services/print.js";

export default function TaskReplyModal() {
    const { tasks, findClient, activeReplyTaskId, closeTaskReply, appendTaskReply, completeTask } = useApp();
    const task = tasks.find((t) => t.id === activeReplyTaskId);

    // Como o Layout monta este componente com key={activeReplyTaskId} (veja
    // components/Layout.jsx), ele já nasce do zero a cada conversa aberta — não
    // precisa de useEffect pra "resetar" o formulário, só pro foco inicial.
    const [role, setRole] = useState("to");
    const [author, setAuthor] = useState(task?.responsible || "");
    const [text, setText] = useState("");
    const [pdfFile, setPdfFile] = useState(null);
    const historyRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [task?.replies?.length]);

    if (!task) return null;

    function selectRole(nextRole) {
        setRole(nextRole);
        setAuthor(nextRole === "from" ? task.from || "" : task.responsible || "");
    }

    function handlePdfChange(event) {
        const file = event.target.files[0];
        if (file && !isAllowedPdf(file)) {
            alert("Por favor, anexe um arquivo PDF.");
            event.target.value = "";
            setPdfFile(null);
            return;
        }
        setPdfFile(file || null);
    }

    async function handleSend() {
        const trimmed = text.trim();
        if (!trimmed) {
            textareaRef.current?.focus();
            return;
        }

        let pdfData = "";
        let pdfName = "";
        if (pdfFile) {
            try {
                pdfData = await fileToDataURL(pdfFile);
                pdfName = pdfFile.name;
            } catch {
                alert("Não foi possível ler o PDF.");
                return;
            }
        }

        await appendTaskReply(task.id, { author: author.trim(), role, text: trimmed, pdfData, pdfName });
        setText("");
        setPdfFile(null);
    }

    function handlePrint() {
        const replies = (task.replies || [])
            .map(
                (r) => `
            <div style="border:1px solid #ddd;border-left:3px solid #d4af37;padding:12px;border-radius:6px;margin-bottom:12px;background:#fafafa">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                    <strong>${escapeHTML(r.author || "Anônimo")}</strong>
                    <span style="color:#666;font-size:0.85rem">${new Date(r.createdAt).toLocaleString("pt-BR")}</span>
                </div>
                <p style="margin:0;white-space:pre-wrap">${escapeHTML(r.text)}</p>
                ${r.pdfName ? `<p style="margin:6px 0 0;font-size:0.82rem;color:#666">📎 Anexo: ${escapeHTML(r.pdfName)}</p>` : ""}
            </div>
        `
            )
            .join("");

        const subtitle = `De: ${escapeHTML(task.from || "—")} · Para: ${escapeHTML(task.responsible || "—")} · Prazo: ${
            task.dueDate ? new Date(`${task.dueDate}T00:00:00`).toLocaleDateString("pt-BR") : "—"
        }`;
        const body = `
            ${task.description ? `<p>${escapeHTML(task.description)}</p><hr style="border:none;border-top:1px solid #ddd;margin:20px 0">` : ""}
            <h2 style="color:#667085;font-size:1rem;font-weight:600;margin-bottom:14px">Mensagens (${(task.replies || []).length})</h2>
            ${replies || '<p style="color:#667085">Nenhuma resposta.</p>'}
        `;

        openPrintWindow(task.title, subtitle, body);
    }

    async function handleComplete() {
        await completeTask(task.id);
        closeTaskReply();
    }

    const client = findClient(task.clientId);
    const subtitleParts = [task.from ? `De: ${task.from}` : null, task.responsible ? `Para: ${task.responsible}` : null].filter(Boolean);
    const replies = task.replies || [];

    return (
        <div id="taskReplyOverlay" className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="taskReplyTitle">
            <div className="modal-panel task-reply-modal chat-modal">
                <div className="preview-header chat-header">
                    <div className="chat-header-info">
                        <div className="chat-avatar" id="taskReplyAvatar">
                            {getInitials(task.responsible || task.from || task.title)}
                        </div>
                        <div>
                            <p className="eyebrow">Conversa da tarefa{client ? ` · ${client.name}` : ""}</p>
                            <h3 id="taskReplyTitle">{task.title}</h3>
                            <p id="taskReplySubtitle" className="chat-subtitle">
                                {subtitleParts.join(" · ") || "Sem participantes definidos"}
                            </p>
                        </div>
                    </div>
                    <button className="icon-button modal-close" type="button" onClick={closeTaskReply} aria-label="Fechar">
                        ×
                    </button>
                </div>

                <div id="taskReplyHistory" className="chat-thread" ref={historyRef}>
                    {replies.length === 0 ? (
                        <p className="chat-empty">Nenhuma mensagem ainda. Comece a conversa abaixo.</p>
                    ) : (
                        replies.map((r) => {
                            const isMine = r.role
                                ? r.role === "to"
                                : (r.author || "").trim().toLowerCase() === (task.responsible || "").trim().toLowerCase() && Boolean(task.responsible);
                            return (
                                <div key={r.id} className={`chat-bubble-row ${isMine ? "from-me" : "from-them"}`}>
                                    <span className="chat-bubble-author">👤 {r.author || "Anônimo"}</span>
                                    <div className="chat-bubble">
                                        {r.text}
                                        {r.pdfName ? (
                                            <>
                                                <br />
                                                <a className="chat-bubble-pdf" href={r.pdfData} download={r.pdfName}>
                                                    📎 {r.pdfName}
                                                </a>
                                            </>
                                        ) : null}
                                    </div>
                                    <span className="chat-bubble-time">{new Date(r.createdAt).toLocaleString("pt-BR")}</span>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="chat-compose">
                    <div className="chat-role-row">
                        <span className="chat-role-label">Enviar como:</span>
                        <div className="chat-role-buttons" id="chatRoleButtons">
                            <button
                                type="button"
                                className={`chat-role-chip ${role === "from" ? "active" : ""}`}
                                onClick={() => selectRole("from")}
                            >
                                De{task.from ? `: ${task.from}` : ""}
                            </button>
                            <button
                                type="button"
                                className={`chat-role-chip ${role === "to" ? "active" : ""}`}
                                onClick={() => selectRole("to")}
                            >
                                Para{task.responsible ? `: ${task.responsible}` : ""}
                            </button>
                        </div>
                        <input
                            id="replyResponsible"
                            type="text"
                            placeholder="Nome de quem está respondendo"
                            className="chat-author-input"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                        />
                    </div>

                    <div className="chat-input-row">
                        <textarea
                            ref={textareaRef}
                            id="replyText"
                            rows={2}
                            placeholder="Digite uma mensagem..."
                            className="chat-textarea"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <button className="btn btn-primary chat-send-button" type="button" onClick={handleSend} aria-label="Enviar">
                            ➤
                        </button>
                    </div>

                    <div className="chat-toolbar">
                        <label className="chat-attach-label" title="Anexar PDF">
                            📎 <span id="replyPdfName">{pdfFile ? pdfFile.name : "Anexar PDF"}</span>
                            <input id="replyPdf" type="file" accept=".pdf,application/pdf" className="chat-file-input" onChange={handlePdfChange} />
                        </label>
                        <div className="chat-toolbar-actions">
                            <button className="btn btn-ghost btn-print" type="button" onClick={handlePrint}>
                                🖨 Imprimir
                            </button>
                            {!task.done ? (
                                <button id="taskReplyCompleteButton" className="btn btn-success" type="button" onClick={handleComplete}>
                                    ✓ CONCLUÍDO
                                </button>
                            ) : null}
                            <button className="btn btn-ghost" type="button" onClick={closeTaskReply}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
