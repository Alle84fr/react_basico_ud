import { useRef, useState } from "react";
import imagemBase from "../imgs/5_lateral_outros.png";
import fotoPadrao from "../imgs/2_rosto_vaca.png";
import AppPopup from "./AppPopup";
import "./animalForm.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const estadoInicial = {
  nome: "",
  raca: "",
  funcao: "",
  dataNascimento: "",
  dataAquisicao: "",
  peso: "",
  cuidador: "",
  observacao: "",
  vacinas: "",
  foto: "",
};

const VACINAS_PADRAO = [
  { nome: "Febre Aftosa", doseUnica: false },
  { nome: "Brucelose (B19)", doseUnica: true },
  { nome: "Raiva Bovina", doseUnica: false },
  { nome: "Clostridose", doseUnica: false },
  { nome: "Doenca reprodutiva", doseUnica: false },
];

function formatarDataBr(valor) {
  if (!valor) return "--";

  const [ano, mes, dia] = String(valor).slice(0, 10).split("-");
  if (!ano || !mes || !dia) return "--";
  return `${dia}/${mes}/${ano}`;
}

function normalizarDose(dose) {
  return {
    dataAplicacao: dose?.dataAplicacao ? String(dose.dataAplicacao).slice(0, 10) : "",
    proximaDose: dose?.proximaDose ? String(dose.proximaDose).slice(0, 10) : "",
  };
}

function criarCarteiraVazia() {
  return VACINAS_PADRAO.map((vacina) => ({
    ...vacina,
    doses: [],
    formularioAberto: false,
    novaDose: { dataAplicacao: "", proximaDose: "" },
  }));
}

function parseCarteira(valor) {
  if (!valor) return criarCarteiraVazia();

  try {
    const carteiraSalva = JSON.parse(valor);
    if (!Array.isArray(carteiraSalva)) return criarCarteiraVazia();

    return VACINAS_PADRAO.map((vacinaPadrao) => {
      const vacinaSalva = carteiraSalva.find((item) => item?.nome === vacinaPadrao.nome);

      return {
        ...vacinaPadrao,
        doses: Array.isArray(vacinaSalva?.doses) ? vacinaSalva.doses.map(normalizarDose) : [],
        formularioAberto: false,
        novaDose: { dataAplicacao: "", proximaDose: "" },
      };
    });
  } catch (_erro) {
    return criarCarteiraVazia();
  }
}

function serializarCarteira(carteira) {
  return JSON.stringify(
    carteira.map((vacina) => ({
      nome: vacina.nome,
      doseUnica: vacina.doseUnica,
      doses: vacina.doses,
    }))
  );
}

function mapearErro(status, mensagem) {
  if (status === 400) return mensagem || "Campos obrigatorios ausentes";
  if (status === 403) return mensagem || "Voce nao tem permissao para esta acao";
  if (status === 404) return mensagem || "Animal nao encontrado";
  if (status === 409) return mensagem || "Animal ja cadastrado";
  if (status === 500) return mensagem || "Erro interno";
  return mensagem || "Nao foi possivel concluir a operacao";
}

function formatarData(valor) {
  if (!valor) return "";
  return String(valor).slice(0, 10);
}

export default function AnimalForm({ modo, usuario, animalInicial, onSucesso, onVoltar }) {
  const inputFotoRef = useRef(null);
  const carteiraInicial = parseCarteira(animalInicial?.vacinas);
  const [form, setForm] = useState(() => ({
    ...estadoInicial,
    ...(animalInicial || {}),
    dataNascimento: formatarData(animalInicial?.dataNascimento),
    dataAquisicao: formatarData(animalInicial?.dataAquisicao),
    peso: animalInicial?.peso ?? "",
    vacinas: serializarCarteira(carteiraInicial),
  }));
  const [carteira, setCarteira] = useState(carteiraInicial);
  const [popup, setPopup] = useState("");
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const tituloTela = modo === "adicionar" ? "Add Animal" : form.nome || "Nome animal";
  const textoFoto = modo === "adicionar" ? "carregar\nfoto" : "";
  const fotoPreview = form.foto || fotoPadrao;

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  }

  function atualizarCarteira(transformador) {
    setCarteira((atual) => {
      const proximaCarteira = transformador(atual);
      setForm((formAtual) => ({
        ...formAtual,
        vacinas: serializarCarteira(proximaCarteira),
      }));
      return proximaCarteira;
    });
  }

  function alternarFormularioVacina(nomeVacina) {
    atualizarCarteira((atual) =>
      atual.map((vacina) =>
        vacina.nome === nomeVacina
          ? {
              ...vacina,
              formularioAberto: !vacina.formularioAberto,
              novaDose: vacina.formularioAberto ? vacina.novaDose : { dataAplicacao: "", proximaDose: "" },
            }
          : vacina
      )
    );
  }

  function atualizarNovaDose(nomeVacina, campo, valor) {
    atualizarCarteira((atual) =>
      atual.map((vacina) =>
        vacina.nome === nomeVacina
          ? {
              ...vacina,
              novaDose: {
                ...vacina.novaDose,
                [campo]: valor,
              },
            }
          : vacina
      )
    );
  }

  function adicionarDose(nomeVacina) {
    const vacina = carteira.find((item) => item.nome === nomeVacina);
    if (!vacina?.novaDose?.dataAplicacao) {
      abrirPopup("Escolha a data da aplicacao para adicionar a dose");
      return;
    }

    if (vacina.doseUnica && vacina.doses.length > 0) {
      abrirPopup("Essa vacina esta marcada como dose unica");
      return;
    }

    atualizarCarteira((atual) =>
      atual.map((item) =>
        item.nome === nomeVacina
          ? {
              ...item,
              doses: [...item.doses, normalizarDose(item.novaDose)],
              formularioAberto: false,
              novaDose: { dataAplicacao: "", proximaDose: "" },
            }
          : item
      )
    );
  }

  function resumoAplicacoes(vacina) {
    if (!vacina.doses.length) return "Sem aplicacao";

    return vacina.doses.map((dose) => formatarDataBr(dose.dataAplicacao)).join(" | ");
  }

  function resumoProximaDose(vacina) {
    if (!vacina.doses.length) return "Sem dose registrada";
    if (vacina.doseUnica) return "Dose unica concluida";

    const ultimaDose = vacina.doses[vacina.doses.length - 1];
    if (ultimaDose?.proximaDose) {
      return `Proxima vacina dia ${formatarDataBr(ultimaDose.proximaDose)}`;
    }

    return "Proxima dose ainda nao informada";
  }

  function abrirPopup(mensagem) {
    setPopup(mensagem);
  }

  function validar() {
    if (!form.nome.trim()) {
      abrirPopup("Nome do animal e obrigatorio");
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
        modo === "adicionar" ? `${API_URL}/api/animais` : `${API_URL}/api/animais/${animalInicial.id}`;
      const metodo = modo === "adicionar" ? "POST" : "PUT";

      const resposta = await fetch(endpoint, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_animal: form.nome,
          raca: form.raca,
          funcao: form.funcao,
          data_nascimento: form.dataNascimento || null,
          data_aquisicao: form.dataAquisicao || null,
          peso: form.peso || null,
          cuidador: form.cuidador,
          observacao: form.observacao,
          vacinas: form.vacinas,
          foto_base64: form.foto,
          cargoSolicitante: usuario?.cargo || "",
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
      <main className="aniform_screen">
        <section className="aniform_frame">
          <h1 className="aniform_title">{tituloTela}</h1>

          <button type="button" className="aniform_photo_box" onClick={() => inputFotoRef.current?.click()}>
            {form.foto ? (
              <img className="aniform_photo_preview" src={fotoPreview} alt="Foto do animal" />
            ) : (
              <span className="aniform_photo_text">{textoFoto}</span>
            )}
            <input ref={inputFotoRef} type="file" accept="image/*" onChange={lerArquivo} />
          </button>

          <section className="aniform_card">
            {modo === "ficha" && (
              <label className="aniform_field">
                <span>ID:</span>
                <input value={animalInicial?.id || ""} readOnly />
              </label>
            )}

            <label className="aniform_field">
              <span>Nome:</span>
              <input name="nome" value={form.nome} onChange={atualizarCampo} />
            </label>

            <label className="aniform_field">
              <span>Raca:</span>
              <input name="raca" value={form.raca} onChange={atualizarCampo} />
            </label>

            <label className="aniform_field">
              <span>Funcao:</span>
              <input name="funcao" value={form.funcao} onChange={atualizarCampo} />
            </label>

            <label className="aniform_field">
              <span>Data Nascimento:</span>
              <input name="dataNascimento" type="date" value={form.dataNascimento} onChange={atualizarCampo} />
            </label>

            <label className="aniform_field">
              <span>Data Aquisicao:</span>
              <input name="dataAquisicao" type="date" value={form.dataAquisicao} onChange={atualizarCampo} />
            </label>

            <label className="aniform_field">
              <span>Peso:</span>
              <input name="peso" type="number" step="0.01" value={form.peso} onChange={atualizarCampo} />
            </label>

            <label className="aniform_field">
              <span>Cuidador:</span>
              <input name="cuidador" value={form.cuidador} onChange={atualizarCampo} />
            </label>

            <label className="aniform_field">
              <span>Observacao:</span>
              <textarea name="observacao" value={form.observacao} onChange={atualizarCampo} />
            </label>

            <section className="aniform_vacinas">
              <button type="button" className="aniform_vacinas_link">
                Carteira de vacinacao
              </button>

              <section className="aniform_vacinas_lista">
                {carteira.map((vacina) => (
                  <article key={vacina.nome} className="aniform_vacina_item">
                    <div className="aniform_vacina_linha">
                      <span className="aniform_vacina_nome">{vacina.nome}:</span>
                      <span className="aniform_vacina_datas">{resumoAplicacoes(vacina)}</span>
                    </div>

                    <div className="aniform_vacina_acoes">
                      <span className="aniform_vacina_alerta">{resumoProximaDose(vacina)}</span>
                      <button
                        type="button"
                        className="aniform_vacina_dose"
                        onClick={() => alternarFormularioVacina(vacina.nome)}
                      >
                        + Dose
                      </button>
                    </div>

                    {vacina.formularioAberto ? (
                      <div className="aniform_vacina_formulario">
                        <label className="aniform_vacina_campo">
                          <span>Aplicacao</span>
                          <input
                            type="date"
                            value={vacina.novaDose.dataAplicacao}
                            onChange={(event) => atualizarNovaDose(vacina.nome, "dataAplicacao", event.target.value)}
                          />
                        </label>

                        <label className="aniform_vacina_campo">
                          <span>Proxima</span>
                          <input
                            type="date"
                            value={vacina.novaDose.proximaDose}
                            onChange={(event) => atualizarNovaDose(vacina.nome, "proximaDose", event.target.value)}
                            disabled={vacina.doseUnica}
                          />
                        </label>

                        <button
                          type="button"
                          className="aniform_vacina_salvar"
                          onClick={() => adicionarDose(vacina.nome)}
                        >
                          Salvar dose
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))}
              </section>
            </section>
          </section>

          <section className="aniform_bottom_actions">
            {modo === "ficha" ? (
              <button
                type="button"
                className="aniform_action_button aniform_action_button_editar"
                onClick={clicarBotaoPrincipal}
                disabled={salvando}
              >
                Editar
              </button>
            ) : null}
            <button type="button" className="aniform_action_button" onClick={clicarBotaoPrincipal} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" className="aniform_action_button aniform_action_button_secundario" onClick={onVoltar}>
              Voltar
            </button>
          </section>
          <img className="aniform_bottom_image" src={imagemBase} alt="Ilustracao inferior" />
        </section>
      </main>

      <AppPopup aberto={confirmacaoAberta} onFechar={() => setConfirmacaoAberta(false)}>
        <p>{`Deseja add mesmo o animal ${form.nome}?`}</p>
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
