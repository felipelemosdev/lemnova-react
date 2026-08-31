// src/components/Footer.jsx
// Migrado de: <footer class="footer"> no fim de index.html (rodapé fixo, presente em
// toda a aplicação — tela de login e sistema logado).

export default function Footer() {
    return (
        <footer className="footer">
            <span>Lemnova 2026 • BETA</span>
            <span className="footer-right">Versão 0.2.0 • React • Sistema interno</span>
        </footer>
    );
}
