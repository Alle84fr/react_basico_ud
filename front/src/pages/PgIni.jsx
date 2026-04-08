import { Link, useLocation } from "react-router-dom";
import logoVaca from "../imgs/1_logo_vaca.png";
import "./pgIni.css";

export default function PgIni() {
  const location = useLocation();
  const apiDisponivel = location.state?.apiDisponivel ?? true;

  return (
    <main className="app_tela ini_tela">
      <section className="app_moldura ini_moldura">
        <section className="ini_cls">
          <img className="ini_logo" src={logoVaca} alt="Logo Ushi" />

          {!apiDisponivel ? <p className="ini_aviso">Servidor indisponivel no momento.</p> : null}

          <nav className="ini_acoes" aria-label="Navegacao inicial">
            <Link className="ini_btn" to="/cadastrar">
              Cadastrar
            </Link>
            <Link className="ini_btn" to="/logar">
              Logar
            </Link>
            <Link className="ini_btn" to="/deve">
              Deve
            </Link>
          </nav>
        </section>
      </section>
    </main>
  );
}
