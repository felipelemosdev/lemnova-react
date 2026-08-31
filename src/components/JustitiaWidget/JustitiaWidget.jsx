// src/components/JustitiaWidget/JustitiaWidget.jsx
// Migrado de: <img class="justitia justitia--float"> + <button id="justitiaCallButton">
// em index.html, e showJustitiaFloating()/hideJustitiaFloating()/toggleJustitiaFloating()
// de js/justitia.js.
//
// Fica montado uma única vez dentro do Layout (casca do sistema logado) e aparece por
// cima de qualquer tela: mostra sozinha por 10s quando a rota muda (ver `pulse()`,
// chamado pelo Layout a cada navegação) e pode ser chamada manualmente pelo botão ⚖.

import { useCallback, useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { useJustitiaAnimation } from "../../hooks/useJustitia.js";
import justitiaCompleto from "../../assets/images/justitiaCompleto.png";

const JustitiaWidget = forwardRef(function JustitiaWidget(_props, forwardedRef) {
    const [floatRef, playFloatAnim] = useJustitiaAnimation(null);
    const hideTimerRef = useRef(null);
    const visibleRef = useRef(false);

    // Mede a altura real do rodapé pra Justitia flutuante "encostar os pés" nele
    // (mesma lógica de updateJustitiaFloorOffset em justitia.js, via CSS var).
    useEffect(() => {
        function updateFloorOffset() {
            const footer = document.querySelector(".footer");
            const height = footer ? footer.getBoundingClientRect().height : 0;
            document.documentElement.style.setProperty("--justitia-floor", `${height}px`);
        }

        updateFloorOffset();
        window.addEventListener("resize", updateFloorOffset);
        return () => window.removeEventListener("resize", updateFloorOffset);
    }, []);

    const hide = useCallback(() => {
        window.clearTimeout(hideTimerRef.current);
        visibleRef.current = false;
        playFloatAnim("disappear");
        document.querySelector(".justitia-call-button")?.classList.remove("is-morphed");
    }, [playFloatAnim]);

    const show = useCallback((duration = 10000) => {
        window.clearTimeout(hideTimerRef.current);
        visibleRef.current = true;
        playFloatAnim("appear");
        document.querySelector(".justitia-call-button")?.classList.add("is-morphed");

        hideTimerRef.current = window.setTimeout(hide, duration);
    }, [playFloatAnim, hide]);

    const toggle = useCallback(() => {
        if (visibleRef.current) {
            hide();
        } else {
            show();
        }
    }, [show, hide]);

    // Expõe pulse() pro Layout chamar a cada troca de rota (equivalente ao
    // showJustitiaFloating(elements.justitiaFloat) dentro de setActiveView em dom.js).
    useImperativeHandle(forwardedRef, () => ({ pulse: show }), [show]);

    return (
        <>
            <img
                ref={floatRef}
                src={justitiaCompleto}
                alt=""
                aria-hidden="true"
                className="justitia justitia--float"
                data-anim="disappear"
            />
            <button
                id="justitiaCallButton"
                className="justitia-call-button"
                type="button"
                title="Chamar Justitia"
                onClick={toggle}
            >
                ⚖
            </button>
        </>
    );
});

export default JustitiaWidget;
