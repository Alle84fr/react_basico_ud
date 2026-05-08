import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppPopup from "../components/AppPopup";
import imagemDetalhe from "../imgs/4_cima_cad.png";
import iconeSenhaMostrar from "../imgs/senha_mostrar.png";
import iconeSenhaOculta from "../imgs/senha_oculta.png";
import "./pgCad.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const estadoInicial = {
  email: "",
  fazenda: "",
  cargo: "",
  senha: "",
};

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function senhaValida(valor) {
  const temMaiuscula = /[A-Z]/.test(valor);
  const numeros = valor.match(/\d/g) || [];
  return temMaiuscula && numeros.length >= 5;
}

function mapearErro(status, mensagem, detalhe) {
  const sufixoDetalhe = detalhe ? `\n${detalhe}` : "";

  if (status === 400) return `${mensagem || "Confira os dados informados"}${sufixoDetalhe}`;
  if (status === 403) return `${mensagem || "Cadastro ainda nao confirmado"}${sufixoDetalhe}`;
  if (status === 404) return `${mensagem || "404 - Pagina nao encontrada"}${sufixoDetalhe}`;
  if (status === 409) return `E-mail ja cadastrado${sufixoDetalhe}`;
  if (status === 500) return `${mensagem || "500 - Erro interno"}${sufixoDetalhe}`;
  return `${mensagem || "Nao foi possivel concluir a operacao"}${sufixoDetalhe}`;
}

export default function PgCad() {
  const navigate = useNavigate();
  const [form, setForm] = useState(estadoInicial);
  const [codigo, setCodigo] = useState("");
  const [popup, setPopup] = useState("");
  const [popupCodigoAberto, setPopupCodigoAberto] = useState(false);
  const [enviandoCadastro, setEnviandoCadastro] = useState(false);
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);
  const [reenviandoCodigo, setReenviandoCodigo] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setForm((atual) => ({
      ...atual,
      [name]: name === "email" ? value.trim().toLowerCase() : value,
    }));
  }

  function validarCadastro() {
    if (!form.email || !form.senha || !form.fazenda || !form.cargo) {
      setPopup("Todos os campos devem ser preenchidos.");
      return false;
    }

    if (!emailValido(form.email)) {
      setPopup("Digite um e-mail valido.");
      return false;
    }

    if (!senhaValida(form.senha)) {
      setPopup("Senha deve conter ao menos uma letra maiuscula e ao menos 5 numeros.");
      return false;
    }

    return true;
  }

  async function cadastrar() {
    if (!validarCadastro()) return;

    setEnviandoCadastro(true);

    try {
      const resposta = await fetch(`${API_URL}/api/cadastro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          cargo: form.cargo,
          fazenda: form.fazenda.trim(),
          senha: form.senha,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        setPopup(mapearErro(resposta.status, dados?.mensagem, dados?.detalhe));
        return;
      }

      setCodigo("");
      setPopupCodigoAberto(true);
    } catch (_erro) {
      setPopup("500 - Erro interno");
    } finally {
      setEnviandoCadastro(false);
    }
  }

  async function confirmarCodigo() {
    if (!codigo) {
      setPopup("Digite o codigo de confirmacao enviado para o e-mail.");
      return;
    }

    setEnviandoCodigo(true);

    try {
      const resposta = await fetch(`${API_URL}/api/confirmar-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          otp: codigo,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        setPopup(mapearErro(resposta.status, dados?.mensagem, dados?.detalhe));
        return;
      }

      const emailConfirmado = form.email;
      setPopupCodigoAberto(false);
      setPopup("Cadastro confirmado com sucesso.");
      setForm(estadoInicial);

      window.setTimeout(() => {
        navigate("/logar", {
          replace: true,
          state: { cadastroConfirmado: true },
        });
      }, 850);
    } catch (_erro) {
      setPopup("500 - Erro interno");
    } finally {
      setEnviandoCodigo(false);
    }
  }

  async function reenviarCodigo() {
    if (!form.email) {
      setPopup("Informe o e-mail para reenviar o codigo.");
      return;
    }

    setReenviandoCodigo(true);

    try {
      const resposta = await fetch(`${API_URL}/api/reenviar-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: form.email }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        setPopup(mapearErro(resposta.status, dados?.mensagem, dados?.detalhe));
        return;
      }

      setPopup("Codigo reenviado por e-mail.");
    } catch (_erro) {
      setPopup("500 - Erro interno");
    } finally {
      setReenviandoCodigo(false);
    }
  }

  return (
    <>
      <main className="app_tela cad_tela">
        <section className="app_moldura cad_moldura">
          <section className="cad_cls">
            <h1 className="cad_titulo">Cadastro</h1>

            <section className="cad_card_box">
              <img className="cad_img" src={imagemDetalhe} alt="Ilustracao decorativa da tela de cadastro" />

              <section className="cad_card">
                <label className="cad_campo">
                  <span className="cad_label">E-mail:</span>
                  <input
                    className="cad_input"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={atualizarCampo}
                    autoComplete="username"
                  />
                </label>

                <label className="cad_campo">
                  <span className="cad_label">Senha:</span>
                  <span className="cad_senha_box">
                    <input
                      className="cad_input cad_input_senha"
                      name="senha"
                      type={mostrarSenha ? "text" : "password"}
                      value={form.senha}
                      onChange={atualizarCampo}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="cad_senha_btn"
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

                <label className="cad_campo">
                  <span className="cad_label">Fazenda</span>
                  <input
                    className="cad_input"
                    name="fazenda"
                    type="text"
                    value={form.fazenda}
                    onChange={atualizarCampo}
                    autoComplete="off"
                  />
                </label>

                <label className="cad_campo">
                  <span className="cad_label">Cargo</span>
                  <select className="cad_input cad_select" name="cargo" value={form.cargo} onChange={atualizarCampo}>
                    <option value=""></option>
                    <option value="dono">Dono</option>
                    <option value="gerente">Gerente</option>
                  </select>
                </label>
              </section>
            </section>

            <button type="button" className="cad_btn cad_btn_principal" onClick={cadastrar} disabled={enviandoCadastro}>
              {enviandoCadastro ? "Cadastrando..." : "Cadastrar"}
            </button>

            <Link className="cad_btn cad_btn_secundario" to="/inicial">
              Voltar
            </Link>
          </section>
        </section>
      </main>

      <AppPopup aberto={Boolean(popup)} mensagem={popup} onFechar={() => setPopup("")} />

      <AppPopup aberto={popupCodigoAberto} onFechar={() => setPopupCodigoAberto(false)}>
        <div className="cad_popup_corpo">
          <p className="cad_popup_texto">Cadastro realizado. Digite o codigo enviado para o e-mail.</p>

          <input
            className={`cad_popup_input ${codigo ? "cad_popup_input_preenchido" : ""}`}
            type="text"
            value={codigo}
            onChange={(event) => setCodigo(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Codigo de confirmacao"
            autoComplete="one-time-code"
          />

          <div className="cad_popup_acoes">
            <button type="button" className="cad_popup_btn_principal" onClick={confirmarCodigo} disabled={enviandoCodigo}>
              {enviandoCodigo ? "Confirmando..." : "Confirmar"}
            </button>
            <button type="button" className="cad_popup_btn_link" onClick={reenviarCodigo} disabled={reenviandoCodigo}>
              {reenviandoCodigo ? "Reenviando..." : "Reenviar codigo"}
            </button>
          </div>
        </div>
      </AppPopup>
    </>
  );
}
