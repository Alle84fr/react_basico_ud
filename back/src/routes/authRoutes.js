import { Router } from "express";
import {
  cadastro,
  esqueciSenha,
  confirmarCadastro,
  health,
  loginUsuario,
  redefinirSenhaUsuario,
  reenviarSenhaHash,
} from "../controllers/authController.js";

const router = Router();

router.get("/health", health);
router.post("/cadastro", cadastro);
router.post("/confirmar-otp", confirmarCadastro);
router.post("/reenviar-otp", reenviarSenhaHash);
router.post("/login", loginUsuario);
router.post("/esqueci-senha", esqueciSenha);
router.post("/redefinir-senha", redefinirSenhaUsuario);

export default router;
