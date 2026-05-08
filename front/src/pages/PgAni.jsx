import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppPopup from "../components/AppPopup";
import imagemBase from "../imgs/5_lateral_outros.png";
import "./pgFun.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function mapearErro(status, mensagem) {
  if (status === 403) return mensagem || "Sem permissao para excluir";
  if (status === 404) return mensagem || "Animal nao encontrado";
  if (status === 500) return mensagem || "Erro interno";
  return mensagem || "Nao foi possivel concluir a operacao";
}

export default function PgAni() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = location.state?.usuario || null;
  const [animais, setAnimais] = useState([]);
  const [popup, setPopup] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const resposta = await fetch(`${API_URL}/api/animais`);
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
          if (ativo) setPopup(dados?.mensagem || "Falha ao carregar animais");
          return;
        }

        if (ativo) setAnimais(dados?.animais || []);
      } catch (_erro) {
        if (ativo) setPopup("Falha ao carregar animais");
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  async function excluir(event, animal) {
    event.stopPropagation();

    try {
      const resposta = await fetch(`${API_URL}/api/animais/${animal.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cargoSolicitante: usuario?.cargo || "",
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        setPopup(mapearErro(resposta.status, dados?.mensagem));
        return;
      }

      setAnimais((atuais) => atuais.filter((item) => item.id !== animal.id));
    } catch (_erro) {
      setPopup("Falha ao excluir animal");
    }
  }

  function abrirFicha(animal) {
    navigate(`/ficha-animal/${animal.id}`, {
      state: { usuario },
    });
  }

  function sair() {
    navigate("/home", { state: { usuario } });
  }

  return (
    <>
      <main className="app_tela pgfun_tela">
        <section className="app_moldura pgfun_moldura">
          <section className="pgfun_frame">
            <h1 className="pgfun_title">Lista Animais</h1>

            <img className="pgfun_top_image" src={imagemBase} alt="Ilustracao decorativa" />

            <section className="pgfun_list_card">
              {animais.map((animal) => (
                <button key={animal.id} type="button" className="pgfun_row" onClick={() => abrirFicha(animal)}>
                  <span className="pgfun_delete" onClick={(event) => excluir(event, animal)}>
                    Del
                  </span>
                  <span className="pgfun_text">Funcao:</span>
                  <span className="pgfun_text">Nome:</span>
                  <span className="pgfun_value">{animal.funcao}</span>
                  <span className="pgfun_value">{animal.nome}</span>
                </button>
              ))}
            </section>

            <section className="pgfun_bottom_actions">
              <button
                type="button"
                className="pgfun_bottom_link"
                onClick={() => navigate("/adicionar-animal", { state: { usuario } })}
              >
                Add Animais
              </button>
              <button type="button" className="pgfun_bottom_link pgfun_bottom_link_secundario" onClick={sair}>
                Voltar
              </button>
            </section>
          </section>
        </section>
      </main>

      <AppPopup aberto={Boolean(popup)} mensagem={popup} onFechar={() => setPopup("")} />
    </>
  );
}
