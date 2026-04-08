import { Router } from "express";
import {
  atualizarFichaFuncionario,
  buscarFuncionario,
  cadastrarFuncionario,
  deletarFuncionario,
  listarTodosFuncionarios,
} from "../controllers/funcionarioController.js";

const router = Router();

router.get("/funcionarios", listarTodosFuncionarios);
router.get("/funcionarios/:id", buscarFuncionario);
router.post("/funcionarios", cadastrarFuncionario);
router.put("/funcionarios/:id", atualizarFichaFuncionario);
router.delete("/funcionarios/:id", deletarFuncionario);

export default router;
