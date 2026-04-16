import { useLocation, useNavigate } from "react-router-dom";
import AnimalForm from "../components/AnimalForm";

export default function PgAddAni() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = location.state?.usuario || null;

  return (
    <AnimalForm
      modo="adicionar"
      usuario={usuario}
      onVoltar={() => navigate("/lista-animal", { state: { usuario } })}
      onSucesso={() => navigate("/lista-animal", { replace: true, state: { usuario } })}
    />
  );
}
