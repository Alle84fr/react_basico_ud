import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import imagemTopo from "../imgs/3_cima_log.png";
import "./pgLog.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function mapearErro(status, mensagem, detalhe) {
  const sufixoDetalhe = detalhe ? `\n${detalhe}` : "";

  if (status === 400) return `${mensagem || "Todos campos devem ser preenchidos"}${sufixoDetalhe}`;
  if (status === 401) return `${mensagem || "E-mail ou senha incorretos"}${sufixoDetalhe}`;
  if (status === 403) return `${mensagem || "E-mail ainda nao confirmado"}${sufixoDetalhe}`;
  if (status === 404) return `${mensagem || "404 - Pagina nao encontrada"}${sufixoDetalhe}`;
  if (status === 500) return `${mensagem || "500 - Erro interno"}${sufixoDetalhe}`;
  return `${mensagem || "Nao foi possivel concluir a operacao"}${sufixoDetalhe}`;
}

export default function PgLog() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const emailRedefinicao = searchParams.get("email") || "";
  const tokenRedefinicao = searchParams.get("token") || "";
  const deveAbrirRedefinicao = searchParams.get("redefinir") === "1";
  const [form, setForm] = useState({
    email: "",
    senha: "",
  });
  const [recuperacaoEmail, setRecuperacaoEmail] = useState("");
  const [campoAtivo, setCampoAtivo] = useState("");
  const [popup, setPopup] = useState(
    location.state?.cadastroConfirmado ? "Cadastro confirmado com sucesso." : ""
  );
  const [enviando, setEnviando] = useState(false);
  const [popupRecuperacaoAberto, setPopupRecuperacaoAberto] = useState(false);
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);
  const [popupRedefinicaoAberto, setPopupRedefinicaoAberto] = useState(deveAbrirRedefinicao);
  const [enviandoRedefinicao, setEnviandoRedefinicao] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);

  useEffect(() => {
    setPopupRedefinicaoAberto(deveAbrirRedefinicao);
  }, [deveAbrirRedefinicao]);

  function atualizarCampo(event) {
    const { name, value } = event.target;

    setForm((atual) => ({
      ...atual,
      [name]: name === "email" ? value.trim().toLowerCase() : value,
    }));
  }

  function abrirPopup(mensagem) {
    setPopup(mensagem);
  }

  function senhaValida(valor) {
    const temMaiuscula = /[A-Z]/.test(valor);
    const numeros = valor.match(/\d/g) || [];
    return temMaiuscula && numeros.length >= 5;
  }

  async function logar() {
    if (!form.email || !form.senha) {
      abrirPopup("Todos campos devem ser inseridos");
      return;
    }

    setEnviando(true);

    try {
      const resposta = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          senha: form.senha,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        abrirPopup(mapearErro(resposta.status, dados?.mensagem, dados?.detalhe));
        return;
      }

      navigate("/splash", {
        replace: true,
        state: {
          destino: "/home",
          estadoDestino: {
            usuario: dados?.usuario,
          },
        },
      });
    } catch (_erro) {
      abrirPopup("500 - Erro interno");
    } finally {
      setEnviando(false);
    }
  }

  async function enviarRecuperacao() {
    if (!recuperacaoEmail) {
      abrirPopup("Todos campos devem ser inseridos");
      return;
    }

    setEnviandoRecuperacao(true);

    try {
      const resposta = await fetch(`${API_URL}/api/esqueci-senha`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: recuperacaoEmail,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        abrirPopup(mapearErro(resposta.status, dados?.mensagem, dados?.detalhe));
        return;
      }

      setPopupRecuperacaoAberto(false);
      abrirPopup(dados?.mensagem || "E-mail enviado para refazer a senha");
    } catch (_erro) {
      abrirPopup("500 - Erro interno");
    } finally {
      setEnviandoRecuperacao(false);
    }
  }

  async function enviarRedefinicao() {
    if (!emailRedefinicao || !tokenRedefinicao || !novaSenha) {
      abrirPopup("Todos campos devem ser inseridos");
      return;
    }

    if (!senhaValida(novaSenha)) {
      abrirPopup("Senha deve conter ao menos uma letra maiuscula e ao menos 5 numeros");
      return;
    }

    setEnviandoRedefinicao(true);

    try {
      const resposta = await fetch(`${API_URL}/api/redefinir-senha`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailRedefinicao,
          token: tokenRedefinicao,
          novaSenha,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        abrirPopup(mapearErro(resposta.status, dados?.mensagem, dados?.detalhe));
        return;
      }

      setPopupRedefinicaoAberto(false);
      setNovaSenha("");
      setSearchParams({});
      setForm((atual) => ({ ...atual, email: emailRedefinicao }));
      abrirPopup("Senha redefinida com sucesso");
    } catch (_erro) {
      abrirPopup("500 - Erro interno");
    } finally {
      setEnviandoRedefinicao(false);
    }
  }

  return (
    <>
      <main className="log_screen">
        <section className="log_frame">
          <img className="log_top_image" src={imagemTopo} alt="Ilustracao de login" />

          <div className="log_card">
            <label className="log_field log_field_overlay">
              <span
                className={`log_field_label ${
                  campoAtivo === "email" || form.email ? "log_field_label_hidden" : ""
                }`}
              >
                E-mail:
              </span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={atualizarCampo}
                onFocus={() => setCampoAtivo("email")}
                onBlur={() => setCampoAtivo("")}
                autoComplete="off"
              />
            </label>

            <label className="log_field log_field_overlay">
              <span
                className={`log_field_label ${
                  campoAtivo === "senha" || form.senha ? "log_field_label_hidden" : ""
                }`}
              >
                Senha:
              </span>
              <input
                name="senha"
                type={mostrarSenha ? "text" : "password"}
                value={form.senha}
                onChange={atualizarCampo}
                onFocus={() => setCampoAtivo("senha")}
                onBlur={() => setCampoAtivo("")}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="log_toggle_button"
                onClick={() => setMostrarSenha((atual) => !atual)}
              >
                {mostrarSenha ? "Ocultar senha" : "Ver senha"}
              </button>
            </label>

            <nav className="log_links">
              <button type="button" className="log_link_button" onClick={logar} disabled={enviando}>
                {enviando ? "Entrando..." : "Logar"}
              </button>

              <Link className="log_text_link" to="/inicial">
                Voltar
              </Link>

              <button
                type="button"
                className="log_link_button"
                onClick={() => {
                  setRecuperacaoEmail(form.email);
                  setPopupRecuperacaoAberto(true);
                }}
              >
                Esqueci
              </button>

              <Link className="log_text_link" to="/cadastrar">
                Registro
              </Link>
            </nav>
          </div>
        </section>
      </main>

      {popup && (
        <div className="log_popup_backdrop" role="presentation" onClick={() => setPopup("")}>
          <div
            className="log_popup"
            role="alertdialog"
            aria-modal="true"
            aria-live="assertive"
            onClick={(event) => event.stopPropagation()}
          >
            <p>{popup}</p>
          </div>
        </div>
      )}

      {popupRecuperacaoAberto && (
        <div
          className="log_popup_backdrop"
          role="presentation"
          onClick={() => setPopupRecuperacaoAberto(false)}
        >
          <div
            className="log_popup log_popup_recovery"
            role="dialog"
            aria-modal="true"
            aria-live="polite"
            onClick={(event) => event.stopPropagation()}
          >
            <label className="log_field log_field_overlay log_popup_field">
              <span
                className={`log_field_label ${
                  campoAtivo === "recuperacaoEmail" || recuperacaoEmail
                    ? "log_field_label_hidden"
                    : ""
                }`}
              >
                E-mail:
              </span>
              <input
                name="recuperacaoEmail"
                type="email"
                value={recuperacaoEmail}
                onChange={(event) => setRecuperacaoEmail(event.target.value.trim().toLowerCase())}
                onFocus={() => setCampoAtivo("recuperacaoEmail")}
                onBlur={() => setCampoAtivo("")}
                autoFocus
                autoComplete="off"
              />
            </label>

            <div className="log_popup_action_row">
              <button
                type="button"
                className="log_link_button"
                onClick={enviarRecuperacao}
                disabled={enviandoRecuperacao}
              >
                {enviandoRecuperacao ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {popupRedefinicaoAberto && (
        <div
          className="log_popup_backdrop"
          role="presentation"
          onClick={() => setPopupRedefinicaoAberto(false)}
        >
          <div
            className="log_popup log_popup_recovery"
            role="dialog"
            aria-modal="true"
            aria-live="polite"
            onClick={(event) => event.stopPropagation()}
          >
            <label className="log_field log_field_overlay log_popup_field">
              <span className="log_field_label log_field_label_hidden">E-mail:</span>
              <input value={emailRedefinicao} readOnly />
            </label>

            <label className="log_field log_field_overlay log_popup_field">
              <span
                className={`log_field_label ${
                  campoAtivo === "novaSenha" || novaSenha ? "log_field_label_hidden" : ""
                }`}
              >
                Nova senha:
              </span>
              <input
                name="novaSenha"
                type={mostrarNovaSenha ? "text" : "password"}
                value={novaSenha}
                onChange={(event) => setNovaSenha(event.target.value)}
                onFocus={() => setCampoAtivo("novaSenha")}
                onBlur={() => setCampoAtivo("")}
                autoFocus
                autoComplete="new-password"
              />
              <button
                type="button"
                className="log_toggle_button"
                onClick={() => setMostrarNovaSenha((atual) => !atual)}
              >
                {mostrarNovaSenha ? "Ocultar senha" : "Ver senha"}
              </button>
            </label>

            <div className="log_popup_action_row">
              <button
                type="button"
                className="log_link_button"
                onClick={enviarRedefinicao}
                disabled={enviandoRedefinicao}
              >
                {enviandoRedefinicao ? "Enviando..." : "Redefinir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
