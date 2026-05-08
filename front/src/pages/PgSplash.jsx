import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gifVaca from "../imgs/0_gif_vaca.gif";
import "./pgSplash.css";

const SPLASH_TEMPO_MS = 3000;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function PgSplash() {
  const navigate = useNavigate();
  const location = useLocation();
  const [erroHttp, setErroHttp] = useState("");
  const destinoAposSplash = location.state?.destino || "/inicial";
  const estadoDestino = location.state?.estadoDestino || null;

  useEffect(() => {
    let ativo = true;

    async function iniciarFluxo() {
      let apiDisponivel = false;
      let codigoErro = "";

      try {
        const [resposta] = await Promise.all([
          fetch(`${API_URL}/api/health`),
          new Promise((resolve) => window.setTimeout(resolve, SPLASH_TEMPO_MS)),
        ]);

        apiDisponivel = resposta.ok;

        if (!resposta.ok) {
          codigoErro = String(resposta.status || 500);
        }
      } catch (_erroRequisicao) {
        codigoErro = "500";
      }

      if (!ativo) {
        return;
      }

      if (!apiDisponivel) {
        setErroHttp(codigoErro);
        return;
      }

      navigate(destinoAposSplash, {
        replace: true,
        state: {
          ...estadoDestino,
          apiDisponivel,
        },
      });
    }

    iniciarFluxo();

    return () => {
      ativo = false;
    };
  }, [destinoAposSplash, estadoDestino, navigate]);

  return (
    <main className="app_tela splash_tela">
      <section className="app_moldura splash_moldura">
        <section className="splash_cls" aria-live="polite">
          <div className="splash_vaca_area">
            <img className="splash_gif" src={gifVaca} alt="Gif abertura com vaca" />
          </div>

          <section className="splash_card">
            <p className="splash_text">{erroHttp ? "Falha ao abrir a porteira" : "Abrindo a porteira"}</p>
            {erroHttp ? <p className="splash_http">Erro HTTP {erroHttp}</p> : <span className="splash_pontos" aria-hidden="true" />}
          </section>
        </section>
      </section>
    </main>
  );
}
