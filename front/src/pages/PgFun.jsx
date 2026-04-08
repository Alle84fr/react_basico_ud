import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppPopup from "../components/AppPopup";
import imagemBase from "../imgs/5_lateral_outros.png";
import fotoPadrao from "../imgs/2_rosto_vaca.png";
import "./pgFun.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function mapearErro(status, mensagem) {
  if (status === 403) return mensagem || "Sem permissao para excluir";
  if (status === 404) return mensagem || "Funcionario nao encontrado";
  if (status === 500) return mensagem || "Erro interno";
  return mensagem || "Nao foi possivel concluir a operacao";
}

export default function PgFun() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = location.state?.usuario || null;
  const [funcionarios, setFuncionarios] = useState([]);
  const [popup, setPopup] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const resposta = await fetch(`${API_URL}/api/funcionarios`);
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
          if (ativo) setPopup(dados?.mensagem || "Falha ao carregar funcionarios");
          return;
        }

        if (ativo) setFuncionarios(dados?.funcionarios || []);
      } catch (_erro) {
        if (ativo) setPopup("Falha ao carregar funcionarios");
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  async function excluir(event, funcionario) {
    event.stopPropagation();

    try {
      const resposta = await fetch(`${API_URL}/api/funcionarios/${funcionario.id}`, {
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

      setFuncionarios((atuais) => atuais.filter((item) => item.id !== funcionario.id));
    } catch (_erro) {
      setPopup("Falha ao excluir funcionario");
    }
  }

  function abrirFicha(funcionario) {
    navigate(`/ficha-funcionario/${funcionario.id}`, {
      state: { usuario },
    });
  }

  function sair() {
    navigate("/home", { state: { usuario } });
  }

  return (
    <>
      <main className="pgfun_screen">
        <section className="pgfun_frame">
          <h1 className="pgfun_title">Funcionarios</h1>

          <section className="pgfun_list_card">
            {funcionarios.map((funcionario) => (
              <button
                key={funcionario.id}
                type="button"
                className="pgfun_row"
                onClick={() => abrirFicha(funcionario)}
              >
                <span className="pgfun_delete" onClick={(event) => excluir(event, funcionario)}>
                  Del
                </span>
                <span className="pgfun_text">{funcionario.funcao}</span>
                <span className="pgfun_text">{funcionario.nome}</span>
                <img
                  className="pgfun_avatar"
                  src={funcionario.foto || fotoPadrao}
                  alt={`Foto de ${funcionario.nome}`}
                />
              </button>
            ))}
          </section>

          <section className="pgfun_bottom_card">
            <button
              type="button"
              className="pgfun_bottom_link"
              onClick={() => navigate("/adicionar-funcionario", { state: { usuario } })}
            >
              Adicionar funcionario
            </button>
            <button type="button" className="pgfun_bottom_link" onClick={sair}>
              Sair
            </button>
          </section>

          <img className="pgfun_bottom_image" src={imagemBase} alt="Ilustracao inferior" />
        </section>
      </main>

      <AppPopup aberto={Boolean(popup)} mensagem={popup} onFechar={() => setPopup("")} />
    </>
  );
}
