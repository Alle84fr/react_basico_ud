import {
  cadastrarUsuario,
  confirmarOtp,
  login,
  redefinirSenha,
  reenviarOtpCadastro,
  solicitarRecuperacaoSenha,
  validarCadastroEntrada,
} from "../services/authService.js";
import { dbConfigurado, smtpConfigurado } from "../config/env.js";

export function health(_req, res) {
  res.json({ ok: true });
}

export async function cadastro(req, res) {
  const { nome, email, cargo, fazenda, senha } = req.body || {};
  const erroValidacao = validarCadastroEntrada({ nome, email, cargo, fazenda, senha });

  if (erroValidacao) {
    return res.status(400).json({ mensagem: erroValidacao });
  }

  if (!smtpConfigurado()) {
    return res.status(500).json({
      mensagem: "SMTP nao configurado",
      detalhe: "Crie o arquivo back/.env com SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS",
    });
  }

  if (!dbConfigurado()) {
    return res.status(500).json({
      mensagem: "Banco SQL Server nao configurado",
      detalhe: "Configure DB_SERVER, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD no back/.env",
    });
  }

  try {
    const resultado = await cadastrarUsuario({ nome, email, cargo, fazenda, senha });
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao enviar e-mail de confirmacao",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}

export async function confirmarCadastro(req, res) {
  const { email, otp } = req.body || {};

  if (!email || !otp) {
    return res.status(400).json({ mensagem: "E-mail e OTP sao obrigatorios" });
  }

  if (!dbConfigurado()) {
    return res.status(500).json({ mensagem: "Banco SQL Server nao configurado" });
  }

  try {
    const resultado = await confirmarOtp({ email, otp });
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao confirmar OTP",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}

export async function reenviarSenhaHash(req, res) {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ mensagem: "E-mail e obrigatorio" });
  }

  if (!smtpConfigurado()) {
    return res.status(500).json({
      mensagem: "SMTP nao configurado",
      detalhe: "Crie o arquivo back/.env com SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS",
    });
  }

  if (!dbConfigurado()) {
    return res.status(500).json({ mensagem: "Banco SQL Server nao configurado" });
  }

  try {
    const resultado = await reenviarOtpCadastro({ email });
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao reenviar codigo OTP",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}

export async function loginUsuario(req, res) {
  const { email, senha } = req.body || {};

  if (!email || !senha) {
    return res.status(400).json({ mensagem: "E-mail e senha sao obrigatorios" });
  }

  if (!dbConfigurado()) {
    return res.status(500).json({ mensagem: "Banco SQL Server nao configurado" });
  }

  try {
    const resultado = await login({ email, senha });
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao realizar login",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}

export async function esqueciSenha(req, res) {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ mensagem: "E-mail e obrigatorio" });
  }

  if (!smtpConfigurado()) {
    return res.status(500).json({
      mensagem: "SMTP nao configurado",
      detalhe: "Crie o arquivo back/.env com SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS",
    });
  }

  if (!dbConfigurado()) {
    return res.status(500).json({ mensagem: "Banco SQL Server nao configurado" });
  }

  try {
    const resultado = await solicitarRecuperacaoSenha({ email });
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao enviar e-mail de recuperacao",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}

export async function redefinirSenhaUsuario(req, res) {
  const { email, token, novaSenha } = req.body || {};

  if (!email || !token || !novaSenha) {
    return res.status(400).json({ mensagem: "E-mail, token e nova senha sao obrigatorios" });
  }

  try {
    const resultado = await redefinirSenha({ email, token, novaSenha });
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao redefinir senha",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}
