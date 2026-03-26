import { Link, useLocation } from "react-router-dom";
import logoVaca from "../imgs/1_logo_vaca.png";
import "./pgIni.css";

export default function PgIni() {
  const location = useLocation();
  const apiDisponivel = location.state?.apiDisponivel ?? true;

  return (
    <main className="ini_screen">
      <section className="ini_cls">
        <img className="ini_logo" src={logoVaca} alt="Logo Ushi" />

        <nav className="ini_card">
          <Link className="ini_link" to="/deve">
            Deve
          </Link>
          <Link className="ini_link" to="/logar">
            Logar
          </Link>
          <Link className="ini_link" to="/cadastrar">
            Cadastrar
          </Link>
        </nav>
      </section>
    </main>
  );
}
