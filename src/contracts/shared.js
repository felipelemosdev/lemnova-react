// src/contracts/shared.js
// Migrado/expandido de: js/contract/core.js — dados fixos do escritório, formatação dos
// campos do cliente e o timbre usado em TODO documento jurídico gerado pelo sistema.
//
// IMPORTANTE (fidelidade visual): o timbre abaixo (círculo com "L" + "LOPES ADVOGADOS" no
// topo, endereço/telefone no rodapé de cada página) foi construído pra reproduzir
// EXATAMENTE o cabeçalho/rodapé que aparece nos PDFs reais do escritório — não é o timbre
// genérico "Débora Lopes / Advogada" que existia no app original (js/contract.js). Não
// altere esses dois blocos (.letterhead-mark e .doc-footer) sem comparar visualmente com
// um PDF já assinado do escritório.

import { formatCpf, formatCep, formatAddress, escapeHTML } from "../services/utils.js";

export const ESCRITORIO = {
    advogadoNome: "DÉBORA CRISTINA DOS SANTOS LOPES",
    advogadoOab: "OAB/RJ 162.559",
    escritorioEndereco: "Av. Marechal Deodoro, nº 474, loja B, Jd. 25 de Agosto - Duque de Caxias/RJ.",
    escritorioTelefone: "Tel.: (21) 2772-7451"
};

// Preenche os campos do cliente no texto do contrato. Quando o dado não existe no
// cadastro, cai numa linha em branco/colchetes — igual aos modelos originais em PDF, que
// têm esses campos como lacunas pra preencher à mão quando falta alguma informação.
export function clientFields(client) {
    return {
        nome: client.name || "_______________________________",
        nacionalidade: client.nationality || "_______________",
        estadoCivil: client.maritalStatus || "_______________",
        profissao: client.profession || "_______________",
        rg: client.rg || "_______________",
        cpf: client.document ? formatCpf(client.document) : "_______________",
        endereco:
            client.address && client.address.street
                ? `${formatAddress(client.address)}${client.address.cep ? ` · CEP ${formatCep(client.address.cep)}` : ""}`
                : "_______________________________________________"
    };
}

// Timbre e rodapé, reproduzindo o layout dos PDFs originais do escritório: círculo com o
// monograma "L" no topo, "LOPES" + "ADVOGADOS" embaixo, e o endereço/telefone repetido no
// rodapé de cada página impressa.
function letterheadHtml() {
    return `
        <div class="letterhead-mark">
            <div class="letterhead-circle">L</div>
            <div class="letterhead-wordmark">LOPES</div>
            <div class="letterhead-sub">ADVOGADOS</div>
        </div>
    `;
}

function footerHtml() {
    return `
        <div class="doc-footer">
            <span>${escapeHTML(ESCRITORIO.escritorioEndereco)}</span>
            <span>${escapeHTML(ESCRITORIO.escritorioTelefone)}</span>
        </div>
    `;
}

// Monta o HTML completo de UM contrato (uma janela de impressão = um documento), com
// timbre no topo e rodapé fixo repetindo em cada página impressa.
export function buildContractDocument(title, client, bodyHtml) {
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
        <title>${escapeHTML(title)} — ${escapeHTML(client.name || "")}</title>
        <style>
            @page { margin: 1.6cm 1.6cm 2.4cm; }

            * { box-sizing: border-box; }

            html, * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
            }

            body {
                font-family: Calibri, Arial, Helvetica, sans-serif;
                color: #1a1a1a;
                margin: 0;
                padding: 0 6px 50px;
                font-size: 11pt;
                line-height: 1.4;
            }

            .letterhead-mark {
                text-align: center;
                margin-bottom: 22px;
            }

            .letterhead-circle {
                width: 46px;
                height: 46px;
                margin: 0 auto 4px;
                border: 1.5px solid #1a1a1a;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Georgia, serif;
                font-size: 1.3rem;
                font-style: italic;
            }

            .letterhead-wordmark {
                font-family: Georgia, serif;
                font-size: 0.95rem;
                letter-spacing: 0.08em;
            }

            .letterhead-sub {
                font-family: Arial, Helvetica, sans-serif;
                font-size: 0.5rem;
                letter-spacing: 0.25em;
                color: #555;
            }

            h1.doc-title {
                text-align: center;
                font-size: 1rem;
                text-decoration: underline;
                margin: 0 0 20px;
            }

            p { margin: 0 0 12px; text-align: justify; }

            strong { font-weight: 700; }

            .doc-footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 8pt;
                font-style: italic;
                color: #333;
                padding: 8px 0;
                border-top: 1px solid #ccc;
            }

            .doc-footer span { display: block; }

            .signature-line {
                margin: 40px auto 4px;
                width: 320px;
                border-top: 1px solid #1a1a1a;
            }

            .signature-block { text-align: center; margin-top: 30px; }
            .signature-name { font-weight: 700; }
        </style>
        </head><body>
        ${letterheadHtml()}
        <h1 class="doc-title">${escapeHTML(title)}</h1>
        ${bodyHtml}
        ${footerHtml()}
        </body></html>`;
}

export function openContractPrintWindow(title, client, bodyHtml) {
    const win = window.open("", "_blank");
    if (!win) {
        alert("O navegador bloqueou a abertura da janela de impressão. Permita pop-ups para este site.");
        return;
    }
    win.document.write(buildContractDocument(title, client, bodyHtml));
    win.document.close();
    win.focus();
    win.print();
}
