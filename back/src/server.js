// carrega autoaticamente o arquivo .env
import "dotenv/config";
// cria servidores HTTP em node.js - rotas get e post e api rest
import express from "express";
import sql from "mssql";
// cross origin resource sharing - front rode outro domínio ou porta
import cors from "cors";
// enviar e-mail via smtp - para enviar otp (one time password)
import nodemailer from "nodemailer";
// gera hash do otp , criptografa
import crypto from "crypto";
// cria salta, hash seguro da senha
import bcrypt from "bcryptjs";

const app = express();

// porta do .ev ou 4000
const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
// tempo para validade de otp
const OTP_TTL_MINUTOS = 10;
const SALT_ROUNDS = 10;

app.use(cors({ origin: FRONTEND_ORIGIN }));
// recebe json no corpo da requisição
app.use(express.json());

// lê servidor bd
const rawDbServer = String(process.env.DB_SERVER || "").trim();
// v^se tem instância nomeada sql
const temInstanciaNomeada = rawDbServer.includes("\\");
const [dbHost, dbInstanceName] = rawDbServer.split("\\");

const dbConfig = {
  server: temInstanciaNomeada ? dbHost : rawDbServer,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT !== "false",
    ...(temInstanciaNomeada ? { instanceName: dbInstanceName } : {}),
  },
  ...(temInstanciaNomeada ? {} : { port: Number(process.env.DB_PORT || 1433) }),
};

// guarda conexão ativa no banco
let poolPromise;

//_______ conexão com bd

// obter conexão
const getPool = async () => {
  // se não existe conexão, cria uma
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig);
  }
  return poolPromise;
};

// ___________ regra de e-mail 


const transporter = nodemailer.createTransport({
  // transportador stmp
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// formato válido
const emailValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
const smtpConfigurado = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
const dbConfigurado = () =>
  Boolean(
    process.env.DB_SERVER &&
      process.env.DB_NAME &&
      process.env.DB_USER &&
      process.env.DB_PASSWORD
  );

// _______________regra cód 

// gera valor de 6 dígitos
const gerarOtp = () => String(Math.floor(100000 + Math.random() * 900000));
//senha temporária hash pega o valor e transforma em hexagonal - base de 16 n°s, de 0 a 9 e letras de a a F
//.update() ->  atualiza do dado apara o algoritmo
const hashOtp = (valor) =>
  // .digest("hex" -> retorna formato hexadecimal - )
  crypto.createHash("sha256").update(String(valor).trim()).digest("hex");

// vê se a rota está ativa
app.get("/api/health", (_req, res) => {
  // res - resposta no formato json
  res.json({ ok: true });
});

app.post("/api/cadastro", async (req, res) => {
  const { nome, email, cargo, fazenda, senha } = req.body || {};

  if (!nome || !email || !cargo || !fazenda || !senha) {
    return res.status(400).json({
      mensagem: "Nome, e-mail, cargo, fazenda e senha sao obrigatorios",
    });
  }

  if (!emailValido(email)) {
    return res.status(400).json({ mensagem: "E-mail invalido" });
  }

  if (!smtpConfigurado()) {
    return res.status(500).json({
      mensagem: "SMTP nao configurado",
      detalhe:
        "Crie o arquivo back/.env com SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS",
    });
  }

  if (!dbConfigurado()) {
    return res.status(500).json({
      mensagem: "Banco SQL Server nao configurado",
      detalhe:
        "Configure DB_SERVER, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD no back/.env",
    });
  }

  try {
    const pool = await getPool();
    // lembrando .trim() tira espaço, email não teme espaço
    const emailNormalizado = String(email).trim().toLowerCase();
    // rouond -quantidade de vezes que irá rodar o processo de senha - quanto mais vezes mais verifica, porém demora mais
    const senhaHash = await bcrypt.hash(String(senha), SALT_ROUNDS);

    const consultaUsuario = await pool
      .request()
      .input("email", sql.NVarChar(255), emailNormalizado)
      .query(`
        SELECT TOP 1 id
        FROM dbo.usuarios
        WHERE email = @email
      `);

    if (consultaUsuario.recordset.length > 0) {
      return res.status(409).json({ mensagem: "Este e-mail ja foi cadastrado" });
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

    await pool
      .request()
      .input("email", sql.NVarChar(255), emailNormalizado)
      .query(`
        UPDATE dbo.otps
        SET usado = 1, usado_em = SYSUTCDATETIME()
        WHERE email = @email AND usado = 0
      `);

    await pool
      .request()
      .input("email", sql.NVarChar(255), emailNormalizado)
      .input("codigo_hash", sql.NVarChar(255), otpHash)
      .input("ttl", sql.Int, OTP_TTL_MINUTOS)
      .query(`
        INSERT INTO dbo.otps (email, codigo_hash, expira_em)
        VALUES (@email, @codigo_hash, DATEADD(MINUTE, @ttl, SYSUTCDATETIME()))
      `);

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: emailNormalizado,
      subject: "Codigo OTP - Confirmacao de cadastro",
      text: `Ola, ${nome}!

Seu codigo de confirmacao (OTP): ${otp}

Validade: ${OTP_TTL_MINUTOS} minutos.

Se nao foi voce, desconsidere este e-mail.`,
      html: `
        <h2>Codigo OTP</h2>
        <p>Ola, <strong>${nome}</strong>!</p>
        <p>Seu codigo de confirmacao (OTP) e:</p>
        <p style="font-size:20px;"><strong>${otp}</strong></p>
        <p>Validade: ${OTP_TTL_MINUTOS} minutos.</p>
        <p>Se nao foi voce, desconsidere este e-mail.</p>
      `,
    });

    return res.json({ mensagem: "OTP enviado por e-mail" });
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao enviar e-mail de confirmacao",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
});

app.post("/api/confirmar-otp", async (req, res) => {
  const { email, otp } = req.body || {};

  if (!email || !otp) {
    return res.status(400).json({ mensagem: "E-mail e OTP sao obrigatorios" });
  }

  if (!dbConfigurado()) {
    return res.status(500).json({ mensagem: "Banco SQL Server nao configurado" });
  }

  try {
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
      return res
        .status(400)
        .json({ mensagem: "OTP nao encontrado para este e-mail" });
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

      return res
        .status(400)
        .json({ mensagem: "OTP expirado. Faca um novo cadastro" });
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

      return res.status(400).json({ mensagem: "OTP invalido" });
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

    return res.json({ mensagem: "Cadastro confirmado com sucesso" });
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao confirmar OTP",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
});

app.post("/api/login", async (req, res) => {
  const { nome, senha } = req.body || {};

  if (!nome || !senha) {
    return res.status(400).json({ mensagem: "Nome e senha sao obrigatorios" });
  }

  if (!dbConfigurado()) {
    return res.status(500).json({ mensagem: "Banco SQL Server nao configurado" });
  }

  try {
    const pool = await getPool();
    const nomeInformado = String(nome).trim();

    const resultado = await pool
      .request()
      .input("nome", sql.NVarChar(120), nomeInformado)
      .query(`
        SELECT id, nome, email, senha_hash, cargo, fazenda, email_confirmado
        FROM dbo.usuarios
        WHERE nome = @nome
      `);

    const usuarios = resultado.recordset;
    if (usuarios.length === 0) {
      return res.status(404).json({ mensagem: "Usuario nao cadastrado" });
    }

    const comparados = await Promise.all(
      usuarios.map(async (u) => ({
        ...u,
        senhaOk: await bcrypt.compare(String(senha), u.senha_hash),
      }))
    );
    const usuario = comparados.find((u) => u.senhaOk);

    if (!usuario) {
      return res.status(401).json({ mensagem: "Nome ou senha incorretos" });
    }

    if (!usuario.email_confirmado) {
      return res.status(403).json({ mensagem: "E-mail ainda nao confirmado" });
    }

    return res.json({
      mensagem: "Login realizado com sucesso",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        fazenda: usuario.fazenda,
      },
    });
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao realizar login",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
});

// executar requisição
app.listen(PORT, () => {
  // executar ao iniciar o servidor
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
