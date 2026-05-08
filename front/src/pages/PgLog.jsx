import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AppPopup from "../components/AppPopup";
import imagemDetalhe from "../imgs/3_cima_log.png";
import iconeSenhaMostrar from "../imgs/senha_mostrar.png";
import iconeSenhaOculta from "../imgs/senha_oculta.png";
import "./pgLog.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function senhaValida(valor) {
  const temMaiuscula = /[A-Z]/.test(valor);
  const numeros = valor.match(/\d/g) || [];
  return temMaiuscula && numeros.length >= 5;
}

function mapearErro(status, mensagem, detalhe) {
  const sufixoDetalhe = detalhe ? `\n${detalhe}` : "";

  if (status === 400) return `${mensagem || "Confira os dados informados"}${sufixoDetalhe}`;
  if (status === 401) return `${mensagem || "E-mail ou senha incorretos"}${sufixoDetalhe}`;
  if (status === 403) return `${mensagem || "E-mail ainda nao confirmado"}${sufixoDetalhe}`;
  if (status === 404) return `${mensagem || "E-mail nao cadastrado"}${sufixoDetalhe}`;
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
  const [popup, setPopup] = useState("");
  const [recuperacaoEmail, setRecuperacaoEmail] = useState("");
  const [popupRecuperacaoAberto, setPopupRecuperacaoAberto] = useState(false);
  const [popupRedefinicaoAberto, setPopupRedefinicaoAberto] = useState(deveAbrirRedefinicao);
  const [enviando, setEnviando] = useState(false);
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);
  const [enviandoRedefinicao, setEnviandoRedefinicao] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);

  useEffect(() => {
    setPopupRedefinicaoAberto(deveAbrirRedefinicao);
  }, [deveAbrirRedefinicao]);

  useEffect(() => {
    setForm({ email: "", senha: "" });
    setRecuperacaoEmail("");
    setPopup("");
    setPopupRecuperacaoAberto(false);
    setMostrarSenha(false);
  }, [location.key]);

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setForm((atual) => ({
      ...atual,
      [name]: name === "email" ? value.trim().toLowerCase() : value,
    }));
  }

  async function logar() {
    if (!form.email || !form.senha) {
      setPopup("Digite e-mail e senha para entrar.");
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
        setPopup(mapearErro(resposta.status, dados?.mensagem, dados?.detalhe));
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
      setPopup("500 - Erro interno");
    } finally {
      setEnviando(false);
    }
  }

  async function enviarRecuperacao() {
    if (!recuperacaoEmail) {
      setPopup("Digite o e-mail para recuperar a senha.");
      return;
    }

    setEnviandoRecuperacao(true);

    try {
      const resposta = await fetch(`${API_URL}/api/esqueci-senha`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: recuperacaoEmail }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        setPopup(mapearErro(resposta.status, dados?.mensagem, dados?.detalhe));
        return;
      }

      setPopupRecuperacaoAberto(false);
      setPopup(dados?.mensagem || "E-mail enviado para refazer a senha.");
    } catch (_erro) {
      setPopup("500 - Erro interno");
    } finally {
      setEnviandoRecuperacao(false);
    }
  }

  async function enviarRedefinicao() {
    if (!emailRedefinicao || !tokenRedefinicao || !novaSenha) {
      setPopup("Digite a nova senha para continuar.");
      return;
    }

    if (!senhaValida(novaSenha)) {
      setPopup("Senha deve conter ao menos uma letra maiuscula e ao menos 5 numeros.");
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
        setPopup(mapearErro(resposta.status, dados?.mensagem, dados?.detalhe));
        return;
      }

      setPopupRedefinicaoAberto(false);
      setNovaSenha("");
      setSearchParams({});
      setForm((atual) => ({ ...atual, email: emailRedefinicao }));
      setPopup("Senha redefinida com sucesso.");
    } catch (_erro) {
      setPopup("500 - Erro interno");
    } finally {
      setEnviandoRedefinicao(false);
    }
  }

  return (
    <>
      <main className="app_tela log_tela">
        <section className="app_moldura log_moldura">
          <section className="log_cls">
            <h1 className="log_titulo">Login</h1>

            <section className="log_card_box">
              <img className="log_img" src={imagemDetalhe} alt="Ilustracao decorativa da tela de login" />

              <section className="log_card">
                <label className="log_campo">
                  <span className="log_label">E-mail:</span>
                  <input className="log_input" name="email" type="email" value={form.email} onChange={atualizarCampo} autoComplete="username" />
                </label>

                <label className="log_campo">
                  <span className="log_label">Senha:</span>
                  <span className="log_senha_box">
                    <input
                      className="log_input log_input_senha"
                      name="senha"
                      type={mostrarSenha ? "text" : "password"}
                      value={form.senha}
                      onChange={atualizarCampo}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="log_senha_btn"
                      onClick={() => setMostrarSenha((atual) => !atual)}
                      aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    >
                      <img
                        src={mostrarSenha ? iconeSenhaMostrar : iconeSenhaOculta}
                        alt=""
                        aria-hidden="true"
                      />
                    </button>
                  </span>
                </label>
              </section>
            </section>

            <button type="button" className="log_btn log_btn_principal" onClick={logar} disabled={enviando}>
              {enviando ? "Entrando..." : "Logar"}
            </button>

            <Link className="log_btn log_btn_secundario" to="/inicial">
              Voltar
            </Link>

            <button
              type="button"
              className="log_link_texto"
              onClick={() => {
                setRecuperacaoEmail(form.email);
                setPopupRecuperacaoAberto(true);
              }}
            >
              Esqueci a senha
            </button>
          </section>
        </section>
      </main>

      <AppPopup aberto={Boolean(popup)} mensagem={popup} onFechar={() => setPopup("")} />

      <AppPopup aberto={popupRecuperacaoAberto} onFechar={() => setPopupRecuperacaoAberto(false)}>
        <div className="log_popup_corpo">
          <p className="log_popup_texto">Digite seu e-mail para receber o link de redefinicao.</p>
          <input
            className="log_popup_input"
            type="email"
            value={recuperacaoEmail}
            onChange={(event) => setRecuperacaoEmail(event.target.value.trim().toLowerCase())}
            placeholder="E-mail"
            autoComplete="email"
          />
          <button type="button" className="log_popup_btn_principal" onClick={enviarRecuperacao} disabled={enviandoRecuperacao}>
            {enviandoRecuperacao ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </AppPopup>

      <AppPopup aberto={popupRedefinicaoAberto} onFechar={() => setPopupRedefinicaoAberto(false)}>
        <div className="log_popup_corpo">
          <p className="log_popup_texto">Defina a nova senha da conta.</p>
          <input className="log_popup_input log_popup_input_readonly" type="text" value={emailRedefinicao} readOnly />
          <div className="log_popup_senha_box">
            <input
              className="log_popup_input log_popup_input_senha"
              type={mostrarNovaSenha ? "text" : "password"}
              value={novaSenha}
              onChange={(event) => setNovaSenha(event.target.value)}
              placeholder="Nova senha"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="log_popup_senha_btn"
              onClick={() => setMostrarNovaSenha((atual) => !atual)}
              aria-label={mostrarNovaSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              <img src={mostrarNovaSenha ? iconeSenhaMostrar : iconeSenhaOculta} alt="" aria-hidden="true" />
            </button>
          </div>
          <button type="button" className="log_popup_btn_principal" onClick={enviarRedefinicao} disabled={enviandoRedefinicao}>
            {enviandoRedefinicao ? "Salvando..." : "Redefinir"}
          </button>
        </div>
      </AppPopup>
    </>
  );
}
