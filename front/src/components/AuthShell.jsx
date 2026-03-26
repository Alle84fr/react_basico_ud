import { Link, useLocation } from "react-router-dom";

export function AuthShell({ title, subtitle, children }) {
  const location = useLocation();

  return (
    <main className="layout">
      <section className="hero-panel">
        <span className="eyebrow">Controle Animal</span>
        <h1>Fluxo de acesso reconstruido para o projeto.</h1>
        <p>
          Cadastro com envio de OTP, confirmacao por e-mail e login conectado ao
          backend em Node.js + SQL Server.
        </p>
        <div className="hero-card">
          <strong>Etapas do sistema</strong>
          <ol>
            <li>Cadastre nome, cargo, fazenda, e-mail e senha.</li>
            <li>Confirme o codigo OTP enviado por e-mail.</li>
            <li>Entre no sistema e veja os dados do usuario.</li>
          </ol>
        </div>
      </section>

      <section className="form-panel">
        <div className="tabs">
          <Link
            className={location.pathname === "/login" ? "tab active" : "tab"}
            to="/login"
          >
            Login
          </Link>
          <Link
            className={location.pathname === "/cadastro" ? "tab active" : "tab"}
            to="/cadastro"
          >
            Cadastro
          </Link>
          <Link
            className={location.pathname === "/confirmacao" ? "tab active" : "tab"}
            to="/confirmacao"
          >
            OTP
          </Link>
        </div>

        <div className="panel-head">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        {children}
      </section>
    </main>
  );
}
