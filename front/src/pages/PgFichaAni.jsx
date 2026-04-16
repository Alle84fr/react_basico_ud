import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AnimalForm from "../components/AnimalForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function PgFichaAni() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = location.state?.usuario || null;
  const [animal, setAnimal] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const resposta = await fetch(`${API_URL}/api/animais/${id}`);
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
          if (ativo) setErro(dados?.mensagem || "Animal nao encontrado");
          return;
        }

        if (ativo) setAnimal(dados?.animal || null);
      } catch (_erro) {
        if (ativo) setErro("Erro ao carregar animal");
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [id]);

  if (erro) {
    return (
      <main className="aniform_screen">
        <section className="aniform_frame">
          <p className="aniform_title">{erro}</p>
        </section>
      </main>
    );
  }

  if (!animal) return null;

  return (
    <AnimalForm
      modo="ficha"
      usuario={usuario}
      animalInicial={animal}
      onVoltar={() => navigate("/lista-animal", { state: { usuario } })}
      onSucesso={() => navigate("/lista-animal", { replace: true, state: { usuario } })}
    />
  );
}
