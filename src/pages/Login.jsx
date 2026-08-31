// src/pages/Login.jsx
// Migrado de: <section id="loginView"> em index.html + handleLogin() de js/auth.js.
//
// A checagem de usuário/senha fixa (admin/1234) é a mesma "gambiarra temporária" que já
// existia no app original — o comentário de lá dizia claramente que isso precisa virar
// autenticação real (Supabase/JWT + PostgreSQL) quando o backend existir. Mantive o aviso
// aqui também de propósito, pra não se perder na migração.

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import fundoTela from "../assets/images/fundotela.png";
import logoNovo from "../assets/images/logonovo.png";
import { useClock } from "../hooks/useClock.js";
import { useJustitiaAnimation } from "../hooks/useJustitia.js";

export default function Login() {
    const { login } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const now = useClock();
    // Mesma animação de entrada do app original: toca "intro" uma vez e volta
    // sozinha pra "glow" (ver JUSTITIA_ANIMATIONS em hooks/useJustitia.js).
    const [justitiaRef] = useJustitiaAnimation("intro");

    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            await login(user, password);
            const redirectTo = location.state?.from?.pathname || "/";
            navigate(redirectTo, { replace: true });
        } catch (error) {
            setMessage(error.message || "Usuário ou senha inválidos.");
        }
    }

    return (
        <section className="login-view" aria-labelledby="loginTitle">
            <img src={fundoTela} alt="" className="login-scene-bg" aria-hidden="true" />

            <video
                ref={justitiaRef}
                className="login-figure"
                autoPlay
                muted
                loop
                playsInline
                aria-hidden="true"
            >
                <source src="/assets/movies/Justitia3.mp4" type="video/mp4" />
            </video>

            <h1 id="loginTitle" className="sr-only">Lemnova - CRM Jurídico - Acesse sua área</h1>

            <div className="login-brand">
                <img src={logoNovo} alt="Lemnova - Gestão Jurídica Inteligente" className="brand-logo-img" />
            </div>

            <form className="login-panel" autoComplete="on" onSubmit={handleSubmit}>
                <label className="field">
                    <span className="sr-only">Login de usuário</span>
                    <input
                        type="text"
                        placeholder="Username"
                        autoComplete="username"
                        required
                        value={user}
                        onChange={(event) => setUser(event.target.value)}
                    />
                </label>

                <label className="field">
                    <span className="sr-only">Senha</span>
                    <input
                        type="password"
                        placeholder="Password"
                        minLength={4}
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </label>

                <a href="#" className="forgot-link">Forgot Password?</a>

                <button className="btn btn-login" type="submit">Login</button>

                <p className="form-message" role="status">{message}</p>
            </form>

            <div className="login-meta">
                <div className="clock-stack">
                    <span className="date-chip date-display">{now}</span>
                    <span className="credit-chip">Feito por Felipe Lemos - 2026</span>
                </div>
            </div>
        </section>
    );
}
