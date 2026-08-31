// src/hooks/useClock.js
// Equivalente a startClock()/updateDateTime() do js/dashboard.js original:
// atualiza a data/hora exibida a cada segundo.

import { useEffect, useState } from "react";

function formatNow() {
    return new Intl.DateTimeFormat("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }).format(new Date());
}

export function useClock() {
    const [now, setNow] = useState(formatNow());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(formatNow()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    return now;
}
