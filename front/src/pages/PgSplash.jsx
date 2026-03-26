import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gifVaca from "../imgs/0_gif_vaca.gif";
import "./pgSplash.css";

const SPLASH_DELAY_MS = 3000;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function PgSplash() {
  const navigate = useNavigate();
  const location = useLocation();
  const destinoAposSplash = location.state?.destino || "/inicial";
  const estadoDestino = location.state?.estadoDestino || null;

  useEffect(() => {
    let ativo = true;

    async function iniciarFluxo() {
      let apiDisponivel = false;

      try {
        const [response] = await Promise.all([
          fetch(`${API_URL}/api/health`),
          new Promise((resolve) => window.setTimeout(resolve, SPLASH_DELAY_MS)),
        ]);

        apiDisponivel = response.ok;
      } catch (_requestError) {
        apiDisponivel = false;
      }

      if (ativo) {
        navigate(destinoAposSplash, {
          replace: true,
          state: {
            ...estadoDestino,
            apiDisponivel,
          },
        });
      }
    }

    iniciarFluxo();

    return () => {
      ativo = false;
    };
  }, [destinoAposSplash, estadoDestino, navigate]);

  return (
    <main className="splash_screen">
      <section className="splash_cls">
        <img className="splash_gif" src={gifVaca} alt="Gif de abertura com vaca" />
        <p className="splash_text">Processando</p>
      </section>
    </main>
  );
}
