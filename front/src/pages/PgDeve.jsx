import { Link, useLocation } from "react-router-dom";
import fotoDeve from "../imgs/7_eu_vaca.jpg";
import "./pgDeve.css";

export default function PgDeve() {
  const location = useLocation();
  const usuario = location.state?.usuario || null;

  return (
    <main className="app_tela deve_tela">
      <section className="app_moldura deve_moldura">
        <section className="deve_frame">
          <h1 className="deve_title">AFR8799</h1>

          <section className="deve_card">
            <div className="deve_photo_wrap">
              <img className="deve_photo" src={fotoDeve} alt="Alessandra FR" />
            </div>

            <p className="deve_bio">
              Alessandra FR .<br />
              Moradora da capital da garota (SP)<br />
              Forma em Design de Moda pelo Senac, j&aacute; cursou<br />
              Design de Games na escola Saga.<br />
              Cursando An&aacute;lise e Desenvolvimento de Sistemas pela faculdade Impacta, resolveu criar este app para que pessoas donas de vaquinhas possam ter na palma de sua m&atilde;o o controle de seu gado.<br />
              Simples, r&aacute;pido para qualquer pessoa usar.
            </p>
          </section>

          <nav className="deve_actions" aria-label="Navegacao da pagina dev logada">
            <Link className="deve_button" to="/home" state={{ usuario }}>
              Voltar
            </Link>
          </nav>
        </section>
      </section>
    </main>
  );
}