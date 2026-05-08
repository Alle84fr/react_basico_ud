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
      <main className="app_tela pgfun_tela">
        <section className="app_moldura pgfun_moldura">
          <section className="pgfun_frame">
            <h1 className="pgfun_title">Lista Funcionários</h1>

            <img className="pgfun_top_image" src={imagemBase} alt="Ilustracao decorativa" />

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
                  <span className="pgfun_text">Função:</span>
                  <span className="pgfun_text">Nome:</span>
                  <span className="pgfun_value">{funcionario.funcao}</span>
                  <span className="pgfun_value">{funcionario.nome}</span>
                </button>
              ))}
            </section>

            <section className="pgfun_bottom_actions">
              <button
                type="button"
                className="pgfun_bottom_link"
                onClick={() => navigate("/adicionar-funcionario", { state: { usuario } })}
              >
                Add funcionário
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

