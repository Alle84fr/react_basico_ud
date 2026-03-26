import { Link, useLocation, useNavigate } from "react-router-dom";
import imagemBase from "../imgs/5_lateral_outros.png";
import "./pgHome.css";

export default function PgHome() {
  const location = useLocation();
  const navigate = useNavigate();
  const nomeUsuario = location.state?.usuario?.nome || "Nome Funcionario";

  function sair() {
    navigate("/splash", {
      replace: true,
      state: {
        destino: "/inicial",
        estadoDestino: null,
      },
    });
  }

  return (
    <main className="home_screen">
      <section className="home_frame">
        <h1 className="home_title">{nomeUsuario}</h1>

        <nav className="home_menu">
          <Link className="home_menu_link" to="/adicionar-funcionario">
            Adicionar funcionario
          </Link>
          <Link className="home_menu_link" to="/adicionar-animal">
            Adicionar animal
          </Link>
          <Link className="home_menu_link" to="/lista-funcionarios">
            Lista funcionarios
          </Link>
          <Link className="home_menu_link" to="/lista-animal">
            Lista animal
          </Link>
        </nav>

        <section className="home_card">
          <button type="button" className="home_card_link" onClick={sair}>
            Sair
          </button>
          <Link className="home_card_link" to="/deve">
            Deve
          </Link>
          <Link className="home_card_link" to="/guia-app">
            Guia do app
          </Link>
        </section>

        <img className="home_bottom_image" src={imagemBase} alt="Ilustracao inferior do app" />
      </section>
    </main>
  );
}
