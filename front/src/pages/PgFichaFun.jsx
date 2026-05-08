import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FuncionarioForm from "../components/FuncionarioForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function PgFichaFun() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = location.state?.usuario || null;
  const [funcionario, setFuncionario] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const resposta = await fetch(`${API_URL}/api/funcionarios/${id}`);
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
          if (ativo) setErro(dados?.mensagem || "Funcionario nao encontrado");
          return;
        }

        if (ativo) setFuncionario(dados?.funcionario || null);
      } catch (_erro) {
        if (ativo) setErro("Erro ao carregar funcionario");
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [id]);

  if (erro) {
    return (
      <main className="funform_screen">
        <section className="funform_frame">
          <p className="funform_title">{erro}</p>
        </section>
      </main>
    );
  }

  if (!funcionario) return null;

  return (
    <FuncionarioForm
      modo="ficha"
      usuario={usuario}
      funcionarioInicial={funcionario}
      onVoltar={() => navigate("/lista-funcionarios", { state: { usuario } })}
      onSucesso={() => navigate("/lista-funcionarios", { replace: true, state: { usuario } })}
    />
  );
}
