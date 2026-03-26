import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import imagemTopo from "../imgs/4_cima_cad.png";
import "./pgCad.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const estadoInicial = {
  nome: "",
  email: "",
  cargo: "",
  fazenda: "",
  senha: "",
  otp: "",
};

function mapearErro(status, mensagem, detalhe) {
  const sufixoDetalhe = detalhe ? `\n${detalhe}` : "";

  if (status === 404) return `404 - Pagina nao encontrada${sufixoDetalhe}`;
  if (status === 400) return `${mensagem || "Todos campos devem ser preenchidos"}${sufixoDetalhe}`;
  if (status === 409) return `E-mail ja cadastrado${sufixoDetalhe}`;
  if (status === 500) return `${mensagem || "500 - Erro interno"}${sufixoDetalhe}`;
  return `${mensagem || "Nao foi possivel concluir a operacao"}${sufixoDetalhe}`;
}

function senhaValida(valor) {
  const temMaiuscula = /[A-Z]/.test(valor);
  const numeros = valor.match(/\d/g) || [];
  return temMaiuscula && numeros.length >= 5;
}

export default function PgCad() {
  const navigate = useNavigate();
  const [form, setForm] = useState(estadoInicial);
  const [popup, setPopup] = useState("");
  const [enviandoCadastro, setEnviandoCadastro] = useState(false);
  const [enviandoOtp, setEnviandoOtp] = useState(false);
  const [campoAtivo, setCampoAtivo] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

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

  function validarCadastro() {
    if (!form.nome || !form.email || !form.cargo || !form.fazenda || !form.senha) {
      abrirPopup("Todos campos devem ser preenchidos");
      return false;
    }

    if (!senhaValida(form.senha)) {
      abrirPopup("Senha deve conter ao menos uma letra maiuscula e ao menos 5 numeros");
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
          nome: form.nome.trim(),
          email: form.email,
          cargo: form.cargo.trim(),
          fazenda: form.fazenda.trim(),
          senha: form.senha,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        if (resposta.status === 409) {
          abrirPopup("E-mail ja cadastrado.");
          return;
        }

        abrirPopup(mapearErro(resposta.status, dados?.mensagem, dados?.detalhe));
        return;
      }

      abrirPopup("Cadastro realizado.Verificar se recebeu senha de confrimação de e-mail .");
    } catch (_erro) {
      abrirPopup("500 - Erro interno");
    } finally {
      setEnviandoCadastro(false);
    }
  }

  async function confirmarOtp() {
    if (!form.otp) {
      abrirPopup("Informe senha enviada para seu e-mail");
      return;
    }

    setEnviandoOtp(true);

    try {
      const resposta = await fetch(`${API_URL}/api/confirmar-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          otp: form.otp,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        abrirPopup(mapearErro(resposta.status, dados?.mensagem, dados?.detalhe));
        return;
      }

      navigate("/logar", {
        replace: true,
        state: { cadastroConfirmado: true },
      });
    } catch (_erro) {
      abrirPopup("500 - Erro interno");
    } finally {
      setEnviandoOtp(false);
    }
  }

  async function reenviarOtp() {
    if (!form.email) {
      abrirPopup("Informe o e-mail para reenviar de senha");
      return;
    }

    setEnviandoOtp(true);

    try {
      const resposta = await fetch(`${API_URL}/api/reenviar-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        abrirPopup(mapearErro(resposta.status, dados?.mensagem, dados?.detalhe));
        return;
      }

      abrirPopup("Senha reenviado por e-mail.");
    } catch (_erro) {
      abrirPopup("500 - Erro interno");
    } finally {
      setEnviandoOtp(false);
    }
  }

  return (
    <>
      <main className="cad_screen">
        <section className="cad_frame">
          <img className="cad_top_image" src={imagemTopo} alt="Ilustracao de cadastro" />

          <div className="cad_card">
            <label className="cad_field cad_field_overlay">
              <span
                className={`cad_field_label ${
                  campoAtivo === "nome" || form.nome ? "cad_field_label_hidden" : ""
                }`}
              >
                Nome:
              </span>
              <input
                name="nome"
                type="text"
                value={form.nome}
                onChange={atualizarCampo}
                onFocus={() => setCampoAtivo("nome")}
                onBlur={() => setCampoAtivo("")}
                autoComplete="off"
              />
            </label>

            <label className="cad_field cad_field_overlay">
              <span
                className={`cad_field_label ${
                  campoAtivo === "email" || form.email ? "cad_field_label_hidden" : ""
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

            <label className="cad_field cad_field_overlay">
              <span
                className={`cad_field_label ${
                  campoAtivo === "cargo" || form.cargo ? "cad_field_label_hidden" : ""
                }`}
              >
                Cargo:
              </span>
              <select
                name="cargo"
                value={form.cargo}
                onChange={atualizarCampo}
                onFocus={() => setCampoAtivo("cargo")}
                onBlur={() => setCampoAtivo("")}
                className={!form.cargo ? "cad_select_empty" : ""}
              >
                <option value=""></option>
                <option value="dono">Dono</option>
                <option value="funcionario">Funcionario</option>
                <option value="gerente">Gerente</option>
              </select>
            </label>

            <label className="cad_field cad_field_overlay">
              <span
                className={`cad_field_label ${
                  campoAtivo === "fazenda" || form.fazenda ? "cad_field_label_hidden" : ""
                }`}
              >
                Fazenda:
              </span>
              <input
                name="fazenda"
                type="text"
                value={form.fazenda}
                onChange={atualizarCampo}
                onFocus={() => setCampoAtivo("fazenda")}
                onBlur={() => setCampoAtivo("")}
                autoComplete="off"
              />
            </label>

            <label className="cad_field cad_field_overlay">
              <span
                className={`cad_field_label ${
                  campoAtivo === "senha" || form.senha ? "cad_field_label_hidden" : ""
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
                autoComplete="new-password"
              />
              <button
                type="button"
                className="cad_toggle_button"
                onClick={() => setMostrarSenha((atual) => !atual)}
              >
                {mostrarSenha ? "Ocultar senha" : "Ver senha"}
              </button>
            </label>

            <div className="cad_action_columns">
              <div className="cad_bottom_links">
                <button type="button" className="cad_link_button" onClick={cadastrar} disabled={enviandoCadastro}>
                  {enviandoCadastro ? "Cadastrando..." : "Cadastrar"}
                </button>

                <Link className="cad_text_link" to="/inicial">
                  Voltar
                </Link>

                <Link className="cad_text_link" to="/logar">
                  Logar
                </Link>
              </div>

              <div className="cad_hash_block">
                <label className="cad_field cad_field_overlay cad_hash_inline_field">
                  <span
                    className={`cad_field_label ${
                      campoAtivo === "otp" || form.otp ? "cad_field_label_hidden" : ""
                    }`}
                  >
                    Inserir codigo OTP
                  </span>
                  <input
                    name="otp"
                    type="text"
                    value={form.otp}
                    onChange={atualizarCampo}
                    onFocus={() => setCampoAtivo("otp")}
                    onBlur={() => setCampoAtivo("")}
                    autoComplete="off"
                  />
                </label>

                <div className="cad_hash_send_row">
                  <button
                    type="button"
                    className="cad_send_button"
                    onClick={confirmarOtp}
                    disabled={enviandoOtp || !form.email || !form.otp}
                  >
                    {enviandoOtp ? "Enviando..." : "Enviar"}
                  </button>
                </div>

                <div className="cad_hash_send_row cad_hash_resend_row">
                  <button
                    type="button"
                    className="cad_resend_button"
                    onClick={reenviarOtp}
                    disabled={enviandoOtp || !form.email}
                  >
                    Reenviar codigo OTP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {popup && (
        <div className="cad_popup_backdrop" role="presentation" onClick={() => setPopup("")}>
          <div
            className="cad_popup"
            role="alertdialog"
            aria-modal="true"
            aria-live="assertive"
            onClick={(event) => event.stopPropagation()}
          >
            <p>{popup}</p>
          </div>
        </div>
      )}
    </>
  );
}
