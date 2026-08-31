// src/hooks/useJustitia.js
// Migrado de: js/justitia.js (motor de animações da Justitia, o mascote/IA do sistema).
//
// A ideia original não mudou: nenhum elemento é criado/destruído por aqui, só o atributo
// data-anim de um elemento que já existe no DOM é trocado — quem decide "o que ela está
// fazendo" visualmente continua sendo o CSS (ver src/styles/justitia.css).
//
// Para adicionar uma animação nova: registre em JUSTITIA_ANIMATIONS aqui embaixo e escreva
// o [data-anim="nome"] correspondente em justitia.css. Nenhum componente precisa mudar.

import { useCallback, useEffect, useRef } from "react";

export const JUSTITIA_ANIMATIONS = {
    idle: { once: false },
    intro: { once: true, returnTo: "glow" },
    glow: { once: false },
    appear: { once: false },
    disappear: { once: false },
    thinking: { once: false }
};

/**
 * Controla a animação (atributo data-anim) de um único elemento da Justitia
 * (o <img>/<video> já presente no DOM, referenciado via ref).
 *
 * @param {string} initialAnim - animação inicial aplicada assim que o elemento existir.
 */
export function useJustitiaAnimation(initialAnim = "idle") {
    const ref = useRef(null);

    const play = useCallback((name) => {
        const element = ref.current;
        if (!element) return;

        const config = JUSTITIA_ANIMATIONS[name];
        if (!config) {
            console.warn(`useJustitia: animação "${name}" não está registrada em JUSTITIA_ANIMATIONS.`);
            return;
        }

        element.dataset.anim = name;

        if (config.once) {
            const handleEnd = () => {
                element.removeEventListener("animationend", handleEnd);
                play(config.returnTo || "idle");
            };
            element.addEventListener("animationend", handleEnd);
        }
    }, []);

    useEffect(() => {
        if (initialAnim) {
            play(initialAnim);
        }
        // Só na montagem — troca de tela é feita chamando play() manualmente.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [ref, play];
}
