import { useMemo, useRef, useState } from "react";
import imagemBase from "../imgs/5_lateral_outros.png";
import fotoPadrao from "../imgs/2_rosto_vaca.png";
import iconeSenhaMostrar from "../imgs/senha_mostrar.png";
import iconeSenhaOculta from "../imgs/senha_oculta.png";
import AppPopup from "./AppPopup";
import "./funcionarioForm.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const estadoInicial = {
  nome: "",
  funcao: "",
  dataAdmissao: "",
  setor: "",
  dataAniversario: "",
  observacao: "",
  senha: "",
  foto: "",
};

function mapearErro(status, mensagem) {
  if (status === 400) return mensagem || "Campos obrigatorios ausentes";
  if (status === 403) return mensagem || "Voce nao tem permissao para esta acao";
  if (status === 404) return mensagem || "Funcionario nao encontrado";
  if (status === 409) return mensagem || "Funcionario ja cadastrado";
  if (status === 500) return mensagem || "Erro interno";
  return mensagem || "Nao foi possivel concluir a operacao";
}

function formatarData(valor) {
  if (!valor) return "";
  return String(valor).slice(0, 10);
}

export default function FuncionarioForm({
  modo,
  usuario,
  funcionarioInicial,
  onSucesso,
  onVoltar,
}) {
  const inputFotoRef = useRef(null);
  const [form, setForm] = useState(() => ({
    ...estadoInicial,
    ...(funcionarioInicial || {}),
    dataAdmissao: formatarData(funcionarioInicial?.dataAdmissao),
    dataAniversario: formatarData(funcionarioInicial?.dataAniversario),
  }));
  const [popup, setPopup] = useState("");
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const cargoAtual = String(usuario?.cargo || "").toLowerCase();
  const podeEditarGerencial = cargoAtual === "dono" || cargoAtual === "gerente";
  const tituloBotao = modo === "adicionar" ? "Salvar" : "Salvar";
  const fotoPreview = form.foto || fotoPadrao;
  const tituloTela = modo === "adicionar" ? "Add Funcionário" : form.nome || "Nome funcionário";
  const textoFoto = modo === "adicionar" ? "carregar\nfoto" : "";

  const camposDesabilitados = useMemo(
    () => ({
      funcao: modo === "ficha" && !podeEditarGerencial,
      setor: modo === "ficha" && !podeEditarGerencial,
      dataAdmissao: modo === "ficha" && !podeEditarGerencial,
      observacao: modo === "ficha" && !podeEditarGerencial,
    }),
    [modo, podeEditarGerencial]
  );

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  }

  function abrirPopup(mensagem) {
    setPopup(mensagem);
  }

  function validar() {
    if (!form.nome.trim() || !form.funcao.trim() || !form.dataAdmissao || !form.senha.trim()) {
      abrirPopup("Nome, funcao, data de admissao e senha sao obrigatorios");
      return false;
    }

    return true;
  }

  function lerArquivo(event) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
      setForm((atual) => ({
        ...atual,
        foto: typeof leitor.result === "string" ? leitor.result : "",
      }));
    };
    leitor.readAsDataURL(arquivo);
  }

  async function salvar() {
    if (!validar()) return;

    setSalvando(true);

    try {
      const endpoint =
        modo === "adicionar"
          ? `${API_URL}/api/funcionarios`
          : `${API_URL}/api/funcionarios/${funcionarioInicial.id}`;
      const metodo = modo === "adicionar" ? "POST" : "PUT";

      const resposta = await fetch(endpoint, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_func: form.nome,
          funcao: form.funcao,
          data_admi: form.dataAdmissao,
          setor: form.setor,
          data_aniversario: form.dataAniversario || null,
          observacao: form.observacao,
          senha: form.senha,
          foto_base64: form.foto,
          cargoSolicitante: cargoAtual,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        abrirPopup(mapearErro(resposta.status, dados?.mensagem));
        return;
      }

      onSucesso?.(dados);
    } catch (_erro) {
      abrirPopup("Erro interno");
    } finally {
      setSalvando(false);
      setConfirmacaoAberta(false);
    }
  }

  function clicarBotaoPrincipal() {
    if (modo === "adicionar") {
      if (!validar()) return;
      setConfirmacaoAberta(true);
      return;
    }

    salvar();
  }

  return (
    <>
      <main className="funform_screen">
        <section className="funform_frame">
          <h1 className="funform_title">{tituloTela}</h1>

          <button type="button" className="funform_photo_box" onClick={() => inputFotoRef.current?.click()}>
            {form.foto ? (
              <img className="funform_photo_preview" src={fotoPreview} alt="Foto do funcionario" />
            ) : (
              <span className="funform_photo_text">{textoFoto}</span>
            )}
            <input ref={inputFotoRef} type="file" accept="image/*" onChange={lerArquivo} />
          </button>

          <section className="funform_card">
            {modo === "ficha" && (
              <label className="funform_field">
                <span>ID:</span>
                <input value={funcionarioInicial?.id || ""} readOnly />
              </label>
            )}

            <label className="funform_field">
              <span>Nome:</span>
              <input name="nome" value={form.nome} onChange={atualizarCampo} autoComplete="name" />
            </label>

            <label className="funform_field">
              <span>Funcao:</span>
              <select
                name="funcao"
                value={form.funcao}
                onChange={atualizarCampo}
                disabled={camposDesabilitados.funcao}
              >
                <option value=""></option>
                <option value="gerente">Gerencia</option>
                <option value="funcionario">Funcionario</option>
                <option value="dono">Dono</option>
              </select>
            </label>

            <label className="funform_field">
              <span>Data Admissão:</span>
              <input
                name="dataAdmissao"
                type="date"
                value={form.dataAdmissao}
                onChange={atualizarCampo}
                disabled={camposDesabilitados.dataAdmissao}
              />
            </label>

            <label className="funform_field">
              <span>Setor:</span>
              <input
                name="setor"
                value={form.setor}
                onChange={atualizarCampo}
                disabled={camposDesabilitados.setor}
              />
            </label>

            <label className="funform_field">
              <span>Data Nascimento:</span>
              <input
                name="dataAniversario"
                type="date"
                value={form.dataAniversario}
                onChange={atualizarCampo}
              />
            </label>

            <label className="funform_field funform_field_password">
              <span>Senha Funcionário:</span>
              <input
                name="senha"
                type={mostrarSenha ? "text" : "password"}
                value={form.senha}
                onChange={atualizarCampo}
                autoComplete={modo === "adicionar" ? "new-password" : "current-password"}
              />
              <button
                type="button"
                className="funform_toggle_button"
                onClick={() => setMostrarSenha((atual) => !atual)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                <img src={mostrarSenha ? iconeSenhaMostrar : iconeSenhaOculta} alt="" aria-hidden="true" />
              </button>
            </label>

            <label className="funform_field">
              <span>Observacao:</span>
              <textarea
                name="observacao"
                value={form.observacao}
                onChange={atualizarCampo}
                disabled={camposDesabilitados.observacao}
              />
            </label>
          </section>

          <section className="funform_bottom_actions">
            <button type="button" className="funform_action_button" onClick={clicarBotaoPrincipal} disabled={salvando}>
              {salvando ? "Salvando..." : modo === "ficha" ? "Salvar" : "Salvar"}
            </button>
            {modo === "ficha" ? (
              <button
                type="button"
                className="funform_action_button funform_action_button_editar"
                onClick={clicarBotaoPrincipal}
                disabled={salvando || !podeEditarGerencial}
              >
                Editar
              </button>
            ) : null}
            <button type="button" className="funform_action_button funform_action_button_secundario" onClick={onVoltar}>
              Voltar
            </button>
          </section>
          <img className="funform_bottom_image" src={imagemBase} alt="Ilustracao inferior" />
        </section>
      </main>

      <AppPopup aberto={confirmacaoAberta} onFechar={() => setConfirmacaoAberta(false)}>
        <p>{`Deseja add mesmo o funcionario ${form.nome}?`}</p>
        <div className="app_popup_actions">
          <button type="button" onClick={salvar}>
            Sim
          </button>
          <button type="button" onClick={() => setConfirmacaoAberta(false)}>
            Nao
          </button>
        </div>
      </AppPopup>

      <AppPopup aberto={Boolean(popup)} mensagem={popup} onFechar={() => setPopup("")} />
    </>
  );
}
