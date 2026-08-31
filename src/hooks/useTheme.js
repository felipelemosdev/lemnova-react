// src/hooks/useTheme.js
// Migrado de: js/theme.js (tema claro/escuro, persistido em localStorage e aplicado via
// atributo data-theme no <html> — ver src/styles/theme-dark.css).
//
// O "flash de tema claro" antes do JS carregar é evitado pelo script inline no <head> de
// index.html (mesmo truque do app original), então esse hook só precisa sincronizar o
// estado do React com o que já foi aplicado.

import { useCallback, useState } from "react";

const THEME_STORAGE_KEY = "juresone.theme";

export function getStoredTheme() {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
    } catch {
        return "light";
    }
}

function applyTheme(theme) {
    if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        document.documentElement.removeAttribute("data-theme");
    }
}

export function useTheme() {
    const [theme, setThemeState] = useState(getStoredTheme);

    const setTheme = useCallback((next) => {
        const normalized = next === "dark" ? "dark" : "light";
        applyTheme(normalized);
        setThemeState(normalized);

        try {
            localStorage.setItem(THEME_STORAGE_KEY, normalized);
        } catch (error) {
            // localStorage indisponível (ex.: modo privado) — o tema funciona
            // normalmente na sessão atual, só não fica salvo pra próxima visita.
            console.warn("Não foi possível salvar a preferência de tema.", error);
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark");
    }, [theme, setTheme]);

    return { theme, setTheme, toggleTheme };
}
