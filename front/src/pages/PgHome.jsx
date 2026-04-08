import { Link, useLocation, useNavigate } from "react-router-dom";
import imagemBase from "../imgs/5_lateral_outros.png";
import "./pgHome.css";

export default function PgHome() {
  const location = useLocation();
  const navigate = useNavigate();
  const nomeUsuario = location.state?.usuario?.nome || "Id do funcionario";

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
    <main className="app_tela home_tela">
      <section className="app_moldura home_moldura">
        <section className="home_frame">
        <h1 className="home_title">{nomeUsuario}</h1>

        <section className="home_panel">
          <nav className="home_menu">
            <Link className="home_menu_link" to="/adicionar-funcionario" state={{ usuario: location.state?.usuario }}>
              Add Funcionário
            </Link>
            <Link className="home_menu_link" to="/adicionar-animal">
              Add Animal
            </Link>
            <Link className="home_menu_link" to="/lista-funcionarios" state={{ usuario: location.state?.usuario }}>
              Lista de Fincionários
            </Link>
            <Link className="home_menu_link" to="/lista-animal">
              Lista de Animais
            </Link>
          </nav>
        </section>

        <section className="home_bottom_area">
          <img className="home_bottom_image" src={imagemBase} alt="Ilustracao inferior do app" />

          <section className="home_card">
            <button type="button" className="home_card_link home_card_link_sair" onClick={sair}>
              Sair
            </button>
            <Link className="home_card_link" to="/deve">
              Deve
            </Link>
            <Link className="home_card_link" to="/guia-app">
              Pag Guia
            </Link>
          </section>
        </section>
        </section>
      </section>
    </main>
  );
}
