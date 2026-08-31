// src/hooks/useCnjLookup.js
// Migrado de: a parte "com efeito colateral" de js/cnj.js — busca o processo na API
// pública do CNJ (DataJud) e devolve os dados prontos pra tela preencher os campos do
// formulário. A parte pura (parsing, detecção de tribunal) mora em services/cnj.js.

import { useCallback, useState } from "react";
import {
    DATAJUD_API_KEY,
    DATAJUD_BASE_URL,
    buildTribunalOptions,
    detectarAlias,
    listarMovimentacoes,
    parseNumeroCnj
} from "../services/cnj.js";

const TRIBUNAL_OPTIONS = buildTribunalOptions();

export function useCnjLookup() {
    const [tribunal, setTribunal] = useState("");
    const [status, setStatus] = useState({ text: "", kind: "" });
    const [loading, setLoading] = useState(false);

    // Chamado a cada tecla digitada no número CNJ: se der pra identificar o tribunal
    // automaticamente pelos dígitos, já pré-seleciona no <select>.
    const handleNumeroChange = useCallback((rawValue) => {
        const parsed = parseNumeroCnj(rawValue);
        const alias = detectarAlias(parsed);
        if (alias) {
            setTribunal(alias);
        }
    }, []);

    const search = useCallback(
        async (numeroCnj) => {
            const parsed = parseNumeroCnj(numeroCnj);
            if (!parsed) {
                setStatus({
                    text: "Número CNJ incompleto. Digite os 20 dígitos no formato 0000000-00.0000.0.00.0000.",
                    kind: "is-error"
                });
                return null;
            }

            const alias = tribunal || detectarAlias(parsed);
            if (!alias) {
                setStatus({
                    text: "Não foi possível identificar o tribunal automaticamente. Selecione manualmente na lista ao lado.",
                    kind: "is-error"
                });
                return null;
            }

            if (!tribunal) {
                setTribunal(alias);
            }

            setLoading(true);
            setStatus({ text: "Consultando a base pública do CNJ (DataJud)...", kind: "is-loading" });

            try {
                const response = await fetch(`${DATAJUD_BASE_URL}/api_publica_${alias}/_search`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `APIKey ${DATAJUD_API_KEY}`
                    },
                    body: JSON.stringify({ query: { match: { numeroProcesso: parsed.digits } } })
                });

                if (!response.ok) {
                    setStatus({
                        text: `O CNJ recusou a consulta (HTTP ${response.status}). Verifique o tribunal selecionado ou tente novamente mais tarde.`,
                        kind: "is-error"
                    });
                    return null;
                }

                const data = await response.json();
                const hit = data?.hits?.hits?.[0];

                if (!hit) {
                    setStatus({
                        text: "Nenhum processo encontrado com este número neste tribunal. Confirme o número ou selecione outro tribunal.",
                        kind: "is-error"
                    });
                    return null;
                }

                const source = hit._source || {};
                const classeNome = source.classe?.nome;
                const orgaoNome = source.orgaoJulgador?.nome;
                const tribunalNome = source.tribunal || alias.toUpperCase();
                const movimentos = Array.isArray(source.movimentos) ? source.movimentos : [];
                const movimentacoes = listarMovimentacoes(source);

                setStatus(
                    movimentos.length
                        ? {
                              text: `Processo encontrado! ${movimentos.length} movimentação(ões) trazida(s) do DataJud (pode não ser o andamento 100% completo — depende do que o tribunal enviou).`,
                              kind: "is-success"
                          }
                        : {
                              text: "Processo encontrado, mas este tribunal não enviou o histórico de movimentações para o DataJud (apenas dados cadastrais). Classe e Tribunal/Vara foram preenchidos.",
                              kind: "is-success"
                          }
                );

                return {
                    processClass: classeNome || "",
                    processCourt: orgaoNome ? `${tribunalNome} - ${orgaoNome}` : tribunalNome,
                    processMovement: movimentacoes || ""
                };
            } catch (error) {
                console.error("Erro ao consultar a API pública do CNJ (DataJud):", error);
                setStatus({
                    text: "Não foi possível concluir a consulta pelo navegador (provável bloqueio de CORS, pois esta API foi feita para uso via backend). Preencha os campos manualmente por enquanto.",
                    kind: "is-error"
                });
                return null;
            } finally {
                setLoading(false);
            }
        },
        [tribunal]
    );

    return { tribunalOptions: TRIBUNAL_OPTIONS, tribunal, setTribunal, status, loading, search, handleNumeroChange };
}
