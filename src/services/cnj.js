// src/services/cnj.js
// Migrado de: js/cnj.js — só a parte "pura" (sem tocar no DOM): parsing do número CNJ,
// detecção automática do tribunal e formatação das movimentações vindas da API pública
// do DataJud. A parte que manda o fetch e atualiza a tela vira o hook
// src/hooks/useCnjLookup.js, que usa estas funções aqui.
//
// Documentação oficial: https://datajud-wiki.cnj.jus.br/api-publica/
//
// IMPORTANTE (mesmo aviso do arquivo original):
// 1) A "Chave Pública" abaixo é divulgada oficialmente pelo CNJ na Wiki do DataJud e pode
//    ser trocada por eles a qualquer momento.
// 2) A API do DataJud foi feita para consumo servidor-a-servidor. Como o Lemnova hoje
//    ainda não tem backend próprio, o navegador pode bloquear a chamada por CORS. Quando
//    o backend Node existir (seu próximo passo depois da migração), o ideal é mover esta
//    chamada pra lá.

export const DATAJUD_BASE_URL = "https://api-publica.datajud.cnj.jus.br";
export const DATAJUD_API_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

// Ordem oficial dos códigos de UF usada pelo CNJ (Resolução CNJ 65/2008)
// [código de 2 dígitos, alias usado nas URLs do DataJud, sigla da UF]
const UF_ORDER = [
    ["01", "ac", "AC"], ["02", "al", "AL"], ["03", "ap", "AP"], ["04", "am", "AM"],
    ["05", "ba", "BA"], ["06", "ce", "CE"], ["07", "df", "DF"], ["08", "es", "ES"],
    ["09", "go", "GO"], ["10", "ma", "MA"], ["11", "mt", "MT"], ["12", "ms", "MS"],
    ["13", "mg", "MG"], ["14", "pa", "PA"], ["15", "pb", "PB"], ["16", "pr", "PR"],
    ["17", "pe", "PE"], ["18", "pi", "PI"], ["19", "rj", "RJ"], ["20", "rn", "RN"],
    ["21", "rs", "RS"], ["22", "ro", "RO"], ["23", "rr", "RR"], ["24", "sc", "SC"],
    ["25", "se", "SE"], ["26", "sp", "SP"], ["27", "to", "TO"]
];

export function buildTribunalOptions() {
    const options = [];

    options.push({ alias: "stj", label: "STJ - Superior Tribunal de Justiça" });

    for (let n = 1; n <= 6; n++) {
        options.push({ alias: "trf" + n, label: "TRF" + n + " - Tribunal Regional Federal" });
    }

    for (let n = 1; n <= 24; n++) {
        options.push({ alias: "trt" + n, label: "TRT" + n + " - Tribunal Regional do Trabalho" });
    }

    UF_ORDER.forEach(([, uf, sigla]) => {
        const alias = uf === "df" ? "tjdft" : "tj" + uf;
        options.push({ alias, label: "TJ" + sigla + " - Tribunal de Justiça" });
    });

    UF_ORDER.forEach(([, uf, sigla]) => {
        options.push({ alias: "tre-" + uf, label: "TRE" + sigla + " - Tribunal Regional Eleitoral" });
    });

    [["sp", "SP"], ["mg", "MG"], ["rs", "RS"]].forEach(([uf, sigla]) => {
        options.push({ alias: "tjm-" + uf, label: "TJM" + sigla + " - Tribunal de Justiça Militar" });
    });

    return options;
}

export function parseNumeroCnj(rawValue) {
    const digits = (rawValue || "").replace(/\D/g, "");
    if (digits.length !== 20) return null;

    return {
        digits,
        sequencial: digits.slice(0, 7),
        digitoVerificador: digits.slice(7, 9),
        ano: digits.slice(9, 13),
        segmento: digits.slice(13, 14),
        tribunal: digits.slice(14, 16),
        orgao: digits.slice(16, 20)
    };
}

export function detectarAlias(parsed) {
    if (!parsed) return null;
    const { segmento, tribunal } = parsed;

    if (segmento === "3") return "stj";

    if (segmento === "4") {
        const n = parseInt(tribunal, 10);
        if (n >= 1 && n <= 6) return "trf" + n;
        return null;
    }

    if (segmento === "5") {
        const n = parseInt(tribunal, 10);
        if (n >= 1 && n <= 24) return "trt" + n;
        return null;
    }

    if (segmento === "6") {
        const match = UF_ORDER.find(([codigo]) => codigo === tribunal);
        return match ? "tre-" + match[1] : null;
    }

    if (segmento === "8") {
        const match = UF_ORDER.find(([codigo]) => codigo === tribunal);
        if (!match) return null;
        return match[1] === "df" ? "tjdft" : "tj" + match[1];
    }

    if (segmento === "9") {
        const mapa = { 13: "tjm-mg", 21: "tjm-rs", 26: "tjm-sp" };
        return mapa[tribunal] || null;
    }

    // Segmentos 1 (STF), 2 (CNJ) e 7 (STM) não têm índice na API pública.
    return null;
}

export function listarMovimentacoes(source) {
    const lista = Array.isArray(source.movimentos) ? source.movimentos : [];
    if (!lista.length) return null;

    const ordenada = [...lista].sort((a, b) => {
        const da = new Date(a.dataHora || 0).getTime();
        const db = new Date(b.dataHora || 0).getTime();
        return db - da; // mais recente primeiro
    });

    return ordenada
        .map((mov) => {
            const nome = mov?.nome || "Movimentação sem descrição";
            const data = mov?.dataHora
                ? new Date(mov.dataHora).toLocaleDateString("pt-BR")
                : "data não informada";
            return `${data} - ${nome}`;
        })
        .join("\n");
}
