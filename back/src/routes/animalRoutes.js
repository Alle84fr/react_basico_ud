import { Router } from "express";
import {
  atualizarFichaAnimal,
  buscarAnimal,
  cadastrarAnimal,
  deletarAnimal,
  listarTodosAnimais,
} from "../controllers/animalController.js";

const router = Router();

router.get("/animais", listarTodosAnimais);
router.get("/animais/:id", buscarAnimal);
router.post("/animais", cadastrarAnimal);
router.put("/animais/:id", atualizarFichaAnimal);
router.delete("/animais/:id", deletarAnimal);

export default router;
