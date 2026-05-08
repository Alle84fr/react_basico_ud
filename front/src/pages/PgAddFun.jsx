import { useLocation, useNavigate } from "react-router-dom";
import FuncionarioForm from "../components/FuncionarioForm";

export default function PgAddFun() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = location.state?.usuario || null;

  return (
    <FuncionarioForm
      modo="adicionar"
      usuario={usuario}
      onVoltar={() => navigate("/lista-funcionarios", { state: { usuario } })}
      onSucesso={() => navigate("/lista-funcionarios", { replace: true, state: { usuario } })}
    />
  );
}
