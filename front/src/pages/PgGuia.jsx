import { useNavigate } from "react-router-dom";
import imagemBase from "../imgs/5_lateral_outros.png";
import "./pgGuia.css";

const custos = [
  ["Alimentacao e pasto", "R$ 180"],
  ["Vacinas e medicamentos", "R$ 60"],
  ["Veterinario", "R$ 150"],
  ["Manutencao da fazenda", "R$ 120"],
  ["Mao de obra", "R$ 160"],
];

const totalCustos = 180 + 60 + 150 + 120 + 160;
const quantidadeVacas = 2;
const custoPorVaca = totalCustos / quantidadeVacas;

export default function PgGuia() {
  const navigate = useNavigate();

  function sair() {
    navigate("/splash", {
      replace: true,
      state: {
        destino: "/inicial",
        estadoDestino: null,
      },
    });
  }

  return (
    <main className="app_tela guia_tela">
      <section className="app_moldura guia_moldura">
        <section className="guia_frame guia_frame_curto">
          <h1 className="guia_title">Guia do app</h1>

          <section className="guia_intro">
            <img className="guia_img" src={imagemBase} alt="Ilustracao do app" />
            <p>
              O Ushi e um app para ajudar pequenos produtores a organizar animais, funcionarios e cuidados da fazenda em um so lugar.
            </p>
          </section>

          <section className="guia_secao">
            <h2>O que e o projeto</h2>
            <p>
              O projeto foi pensado para quem tem poucos animais e precisa lembrar informacoes importantes sem depender de papel solto: nome, foto, cuidador, vacinas, observacoes e historico de cada ficha.
            </p>
          </section>

          <section className="guia_secao">
            <h2>Como controlar</h2>
            <p>
              Na Home, entre em <strong>Add Animal</strong> para cadastrar o animal e em <strong>Lista de Animais</strong> para consultar ou editar a ficha. Use observacoes para anotar vacina, cio, parto, doenca, peso, producao ou qualquer cuidado importante.
            </p>
          </section>

          <section className="guia_secao">
            <h2>Conta mensal</h2>
            <p>
              Para saber quanto custa manter cada vaca, some os gastos do mes e divida pela quantidade de animais. Este exemplo usa valores fixos para duas vacas.
            </p>
            <dl className="guia_custos">
              {custos.map(([nome, valor]) => (
                <div className="guia_custo" key={nome}>
                  <dt>{nome}</dt>
                  <dd>{valor}</dd>
                </div>
              ))}
            </dl>
            <p className="guia_total">
              Soma: <strong>R$ {totalCustos}</strong>. Quantidade de vacas: <strong>{quantidadeVacas}</strong>. Conta: <strong>R$ {totalCustos} / {quantidadeVacas} = R$ {custoPorVaca}</strong>. O custo seria <strong>R$ {custoPorVaca} por vaca/mes</strong>.
            </p>
          </section>

          <button type="button" className="guia_sair" onClick={sair}>
            Sair
          </button>
        </section>
      </section>
    </main>
  );
}