import bcrypt from "bcryptjs";
import crypto from "crypto";
import { env } from "../config/env.js";
import { getPool, sql } from "../config/db.js";
import { enviarOtpPorEmail, enviarRecuperacaoSenhaPorEmail } from "./mailService.js";

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function gerarOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(valor) {
  return crypto.createHash("sha256").update(String(valor).trim()).digest("hex");
}

function base64UrlEncode(valor) {
  return Buffer.from(valor).toString("base64url");
}

function base64UrlDecode(valor) {
  return Buffer.from(valor, "base64url").toString("utf8");
}

function assinarToken(payloadBase64) {
  return crypto.createHmac("sha256", env.tokenSecret).update(payloadBase64).digest("base64url");
}

function criarTokenRecuperacao(email) {
  const payload = {
    email: String(email).trim().toLowerCase(),
    exp: Date.now() + env.resetSenhaTtlMinutos * 60 * 1000,
  };
  const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
  const assinatura = assinarToken(payloadBase64);
  return `${payloadBase64}.${assinatura}`;
}

function validarTokenRecuperacao(token, email) {
  if (!token || !email) return false;

  const [payloadBase64, assinatura] = String(token).split(".");
  if (!payloadBase64 || !assinatura) return false;

  const assinaturaEsperada = assinarToken(payloadBase64);
  if (assinatura !== assinaturaEsperada) return false;

  const payload = JSON.parse(base64UrlDecode(payloadBase64));
  if (payload.exp < Date.now()) return false;

  return String(payload.email).trim().toLowerCase() === String(email).trim().toLowerCase();
}

async function salvarOtp({ email, otpHash }) {
  const pool = await getPool();

  await pool
    .request()
    .input("email", sql.NVarChar(255), email)
    .query(`
      UPDATE dbo.otps
      SET usado = 1, usado_em = SYSUTCDATETIME()
      WHERE email = @email AND usado = 0
    `);

  await pool
    .request()
    .input("email", sql.NVarChar(255), email)
    .input("codigo_hash", sql.NVarChar(255), otpHash)
    .input("ttl", sql.Int, env.otpTtlMinutos)
    .query(`
      INSERT INTO dbo.otps (email, codigo_hash, expira_em)
      VALUES (@email, @codigo_hash, DATEADD(MINUTE, @ttl, SYSUTCDATETIME()))
    `);
}

export function validarCadastroEntrada({ nome, email, cargo, fazenda, senha }) {
  if (!nome || !email || !cargo || !fazenda || !senha) {
    return "Nome, e-mail, cargo, fazenda e senha sao obrigatorios";
  }

  if (!emailValido(email)) {
    return "E-mail invalido";
  }

  return null;
}

export async function cadastrarUsuario({ nome, email, cargo, fazenda, senha }) {
  const pool = await getPool();
  const emailNormalizado = String(email).trim().toLowerCase();
  const senhaHash = await bcrypt.hash(String(senha), env.saltRounds);

  const consultaUsuario = await pool
    .request()
    .input("email", sql.NVarChar(255), emailNormalizado)
    .query(`
      SELECT TOP 1 id
      FROM dbo.usuarios
      WHERE email = @email
    `);

  if (consultaUsuario.recordset.length > 0) {
    return { status: 409, body: { mensagem: "Este e-mail ja foi cadastrado" } };
  }

  await pool
    .request()
    .input("nome", sql.NVarChar(120), String(nome).trim())
    .input("email", sql.NVarChar(255), emailNormalizado)
    .input("senha_hash", sql.NVarChar(255), senhaHash)
    .input("cargo", sql.NVarChar(80), String(cargo).trim())
    .input("fazenda", sql.NVarChar(120), String(fazenda).trim())
    .query(`
      INSERT INTO dbo.usuarios (nome, email, senha_hash, cargo, fazenda, email_confirmado)
      VALUES (@nome, @email, @senha_hash, @cargo, @fazenda, 0)
    `);

  const otp = gerarOtp();
  const otpHash = hashOtp(otp);
  await salvarOtp({ email: emailNormalizado, otpHash });

  await enviarOtpPorEmail({
    nome,
    email: emailNormalizado,
    otp,
    validadeMinutos: env.otpTtlMinutos,
  });

  return { status: 200, body: { mensagem: "OTP enviado por e-mail" } };
}

export async function reenviarOtpCadastro({ email }) {
  const pool = await getPool();
  const emailNormalizado = String(email).trim().toLowerCase();

  const resultado = await pool
    .request()
    .input("email", sql.NVarChar(255), emailNormalizado)
    .query(`
      SELECT TOP 1 nome, email_confirmado
      FROM dbo.usuarios
      WHERE email = @email
    `);

  const usuario = resultado.recordset[0];
  if (!usuario) {
    return { status: 404, body: { mensagem: "E-mail nao cadastrado" } };
  }

  if (usuario.email_confirmado) {
    return { status: 400, body: { mensagem: "E-mail ja confirmado" } };
  }

  const otp = gerarOtp();
  const otpHash = hashOtp(otp);
  await salvarOtp({ email: emailNormalizado, otpHash });

  await enviarOtpPorEmail({
    nome: usuario.nome,
    email: emailNormalizado,
    otp,
    validadeMinutos: env.otpTtlMinutos,
  });

  return { status: 200, body: { mensagem: "Codigo OTP reenviado por e-mail" } };
}

export async function confirmarOtp({ email, otp }) {
  const pool = await getPool();
  const emailNormalizado = String(email).trim().toLowerCase();
  const otpHash = hashOtp(otp);

  const resultadoOtp = await pool
    .request()
    .input("email", sql.NVarChar(255), emailNormalizado)
    .query(`
      SELECT TOP 1 id, codigo_hash, expira_em, usado
      FROM dbo.otps
      WHERE email = @email
      ORDER BY criado_em DESC
    `);

  const registro = resultadoOtp.recordset[0];
  if (!registro || registro.usado) {
    return { status: 400, body: { mensagem: "OTP nao encontrado para este e-mail" } };
  }

  if (new Date(registro.expira_em).getTime() < Date.now()) {
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, registro.id)
      .query(`
        UPDATE dbo.otps
        SET usado = 1, usado_em = SYSUTCDATETIME()
        WHERE id = @id
      `);

    return { status: 400, body: { mensagem: "OTP expirado. Faca um novo cadastro" } };
  }

  if (registro.codigo_hash !== otpHash) {
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, registro.id)
      .query(`
        UPDATE dbo.otps
        SET tentativas = tentativas + 1
        WHERE id = @id
      `);

    return { status: 400, body: { mensagem: "OTP invalido" } };
  }

  await pool
    .request()
    .input("id", sql.UniqueIdentifier, registro.id)
    .query(`
      UPDATE dbo.otps
      SET usado = 1, usado_em = SYSUTCDATETIME()
      WHERE id = @id
    `);

  await pool
    .request()
    .input("email", sql.NVarChar(255), emailNormalizado)
    .query(`
      UPDATE dbo.usuarios
      SET email_confirmado = 1, atualizado_em = SYSUTCDATETIME()
      WHERE email = @email
    `);

  return { status: 200, body: { mensagem: "Cadastro confirmado com sucesso" } };
}

export async function login({ email, senha }) {
  const pool = await getPool();
  const emailInformado = String(email).trim().toLowerCase();

  const resultado = await pool
    .request()
    .input("email", sql.NVarChar(255), emailInformado)
    .query(`
      SELECT id, nome, email, senha_hash, cargo, fazenda, email_confirmado
      FROM dbo.usuarios
      WHERE email = @email
    `);

  const usuario = resultado.recordset[0];
  if (!usuario) {
    return { status: 404, body: { mensagem: "E-mail nao cadastrado" } };
  }

  const senhaOk = await bcrypt.compare(String(senha), usuario.senha_hash);
  if (!senhaOk) {
    return { status: 401, body: { mensagem: "E-mail ou senha incorretos" } };
  }

  if (!usuario.email_confirmado) {
    return { status: 403, body: { mensagem: "E-mail ainda nao confirmado" } };
  }

  return {
    status: 200,
    body: {
      mensagem: "Login realizado com sucesso",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        fazenda: usuario.fazenda,
      },
    },
  };
}

export async function solicitarRecuperacaoSenha({ email }) {
  const pool = await getPool();
  const emailInformado = String(email).trim().toLowerCase();

  const resultado = await pool
    .request()
    .input("email", sql.NVarChar(255), emailInformado)
    .query(`
      SELECT TOP 1 nome, email, email_confirmado
      FROM dbo.usuarios
      WHERE email = @email
    `);

  const usuario = resultado.recordset[0];
  if (!usuario) {
    return { status: 404, body: { mensagem: "E-mail nao cadastrado" } };
  }

  const token = criarTokenRecuperacao(emailInformado);
  const linkRecuperacao =
    `${env.frontendOrigin}/logar?redefinir=1&email=${encodeURIComponent(emailInformado)}` +
    `&token=${encodeURIComponent(token)}`;

  await enviarRecuperacaoSenhaPorEmail({
    nome: usuario.nome,
    email: usuario.email,
    linkRecuperacao,
  });

  return { status: 200, body: { mensagem: "E-mail enviado para refazer a senha" } };
}

export async function redefinirSenha({ email, token, novaSenha }) {
  if (!validarTokenRecuperacao(token, email)) {
    return { status: 400, body: { mensagem: "Link de redefinicao invalido ou expirado" } };
  }

  const pool = await getPool();
  const emailInformado = String(email).trim().toLowerCase();

  const resultado = await pool
    .request()
    .input("email", sql.NVarChar(255), emailInformado)
    .query(`
      SELECT TOP 1 id
      FROM dbo.usuarios
      WHERE email = @email
    `);

  const usuario = resultado.recordset[0];
  if (!usuario) {
    return { status: 404, body: { mensagem: "E-mail nao cadastrado" } };
  }

  const senhaHash = await bcrypt.hash(String(novaSenha), env.saltRounds);

  await pool
    .request()
    .input("email", sql.NVarChar(255), emailInformado)
    .input("senha_hash", sql.NVarChar(255), senhaHash)
    .query(`
      UPDATE dbo.usuarios
      SET senha_hash = @senha_hash, atualizado_em = SYSUTCDATETIME()
      WHERE email = @email
    `);

  return { status: 200, body: { mensagem: "Senha redefinida com sucesso" } };
}
