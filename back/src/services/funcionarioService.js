import bcrypt from "bcryptjs";
import { getPool, sql } from "../config/db.js";
import { env } from "../config/env.js";

function texto(valor) {
  return String(valor || "").trim();
}

function dataOuNull(valor) {
  return valor ? String(valor).trim() : null;
}

function cargoPodeExcluir(cargo) {
  return cargo === "dono" || cargo === "gerente";
}

function cargoPodeEditarCamposGerenciais(cargo) {
  return cargo === "dono" || cargo === "gerente";
}

async function garantirTabelaFuncionarios() {
  const pool = await getPool();

  await pool.request().query(`
    IF OBJECT_ID('dbo.funcionarios', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.funcionarios (
        id_func NVARCHAR(4) NOT NULL
          CONSTRAINT PK_funcionarios PRIMARY KEY,
        nome_func NVARCHAR(120) NOT NULL,
        funcao NVARCHAR(80) NOT NULL,
        data_admi DATE NOT NULL,
        setor NVARCHAR(120) NULL,
        data_aniversario DATE NULL,
        observacao NVARCHAR(500) NULL,
        senha_hash NVARCHAR(255) NOT NULL,
        foto_base64 NVARCHAR(MAX) NULL,
        criado_em DATETIME2(0) NOT NULL
          CONSTRAINT DF_funcionarios_criado_em DEFAULT SYSUTCDATETIME(),
        atualizado_em DATETIME2(0) NOT NULL
          CONSTRAINT DF_funcionarios_atualizado_em DEFAULT SYSUTCDATETIME()
      );
    END
  `);
}

async function gerarProximoId(pool) {
  const resultado = await pool.request().query(`
    SELECT MAX(CAST(RIGHT(id_func, 3) AS INT)) AS ultimo_numero
    FROM dbo.funcionarios
    WHERE id_func LIKE 'F[0-9][0-9][0-9]'
  `);

  const ultimoNumero = Number(resultado.recordset[0]?.ultimo_numero || 0) + 1;
  return `F${String(ultimoNumero).padStart(3, "0")}`;
}

function validarCamposObrigatorios({ nome_func, funcao, data_admi, senha }) {
  if (!texto(nome_func) || !texto(funcao) || !texto(data_admi) || !texto(senha)) {
    return "Nome, funcao, data de admissao e senha sao obrigatorios";
  }

  return null;
}

function mapearFuncionario(registro) {
  return {
    id: registro.id_func,
    nome: registro.nome_func,
    funcao: registro.funcao,
    dataAdmissao: registro.data_admi,
    setor: registro.setor || "",
    dataAniversario: registro.data_aniversario,
    observacao: registro.observacao || "",
    foto: registro.foto_base64 || "",
  };
}

export async function listarFuncionarios() {
  await garantirTabelaFuncionarios();
  const pool = await getPool();

  const resultado = await pool.request().query(`
    SELECT id_func, nome_func, funcao, data_admi, setor, data_aniversario, observacao, foto_base64
    FROM dbo.funcionarios
    ORDER BY nome_func ASC
  `);

  return {
    status: 200,
    body: {
      funcionarios: resultado.recordset.map(mapearFuncionario),
    },
  };
}

export async function buscarFuncionarioPorId(id) {
  await garantirTabelaFuncionarios();
  const pool = await getPool();

  const resultado = await pool
    .request()
    .input("id_func", sql.NVarChar(4), texto(id))
    .query(`
      SELECT id_func, nome_func, funcao, data_admi, setor, data_aniversario, observacao, foto_base64
      FROM dbo.funcionarios
      WHERE id_func = @id_func
    `);

  const funcionario = resultado.recordset[0];
  if (!funcionario) {
    return { status: 404, body: { mensagem: "Funcionario nao encontrado" } };
  }

  return {
    status: 200,
    body: {
      funcionario: mapearFuncionario(funcionario),
    },
  };
}

export async function criarFuncionario(dados) {
  await garantirTabelaFuncionarios();
  const erroValidacao = validarCamposObrigatorios(dados);
  if (erroValidacao) {
    return { status: 400, body: { mensagem: erroValidacao } };
  }

  const pool = await getPool();
  const nomeNormalizado = texto(dados.nome_func).toLowerCase();

  const duplicado = await pool
    .request()
    .input("nome_busca", sql.NVarChar(120), nomeNormalizado)
    .query(`
      SELECT TOP 1 id_func
      FROM dbo.funcionarios
      WHERE LOWER(nome_func) = @nome_busca
    `);

  if (duplicado.recordset.length > 0) {
    return { status: 409, body: { mensagem: `Funcionario ${texto(dados.nome_func)} ja cadastrado` } };
  }

  const idFunc = await gerarProximoId(pool);
  const senhaHash = await bcrypt.hash(String(dados.senha), env.saltRounds);

  await pool
    .request()
    .input("id_func", sql.NVarChar(4), idFunc)
    .input("nome_func", sql.NVarChar(120), texto(dados.nome_func))
    .input("funcao", sql.NVarChar(80), texto(dados.funcao))
    .input("data_admi", sql.Date, texto(dados.data_admi))
    .input("setor", sql.NVarChar(120), texto(dados.setor) || null)
    .input("data_aniversario", sql.Date, dataOuNull(dados.data_aniversario))
    .input("observacao", sql.NVarChar(500), texto(dados.observacao) || null)
    .input("senha_hash", sql.NVarChar(255), senhaHash)
    .input("foto_base64", sql.NVarChar(sql.MAX), texto(dados.foto_base64) || null)
    .query(`
      INSERT INTO dbo.funcionarios (
        id_func,
        nome_func,
        funcao,
        data_admi,
        setor,
        data_aniversario,
        observacao,
        senha_hash,
        foto_base64
      )
      VALUES (
        @id_func,
        @nome_func,
        @funcao,
        @data_admi,
        @setor,
        @data_aniversario,
        @observacao,
        @senha_hash,
        @foto_base64
      )
    `);

  return {
    status: 201,
    body: {
      mensagem: "Funcionario cadastrado com sucesso",
      id: idFunc,
    },
  };
}

export async function atualizarFuncionario(id, dados) {
  await garantirTabelaFuncionarios();
  const pool = await getPool();
  const idInformado = texto(id);
  const cargoSolicitante = texto(dados.cargoSolicitante).toLowerCase();

  const resultado = await pool
    .request()
    .input("id_func", sql.NVarChar(4), idInformado)
    .query(`
      SELECT id_func, nome_func, funcao, data_admi, setor, data_aniversario, observacao, senha_hash, foto_base64
      FROM dbo.funcionarios
      WHERE id_func = @id_func
    `);

  const funcionario = resultado.recordset[0];
  if (!funcionario) {
    return { status: 404, body: { mensagem: "Funcionario nao encontrado" } };
  }

  if (!cargoPodeEditarCamposGerenciais(cargoSolicitante)) {
    const houveMudancaGerencial =
      texto(dados.funcao) !== texto(funcionario.funcao) ||
      texto(dados.setor) !== texto(funcionario.setor) ||
      texto(dados.data_admi) !== String(funcionario.data_admi).slice(0, 10) ||
      texto(dados.observacao) !== texto(funcionario.observacao);

    if (houveMudancaGerencial) {
      return {
        status: 403,
        body: { mensagem: "Somente gerente ou dono podem alterar funcao, setor, data de admissao e observacao" },
      };
    }
  }

  const senhaHash = texto(dados.senha)
    ? await bcrypt.hash(String(dados.senha), env.saltRounds)
    : funcionario.senha_hash;

  await pool
    .request()
    .input("id_func", sql.NVarChar(4), idInformado)
    .input("nome_func", sql.NVarChar(120), texto(dados.nome_func) || texto(funcionario.nome_func))
    .input("funcao", sql.NVarChar(80), texto(dados.funcao) || texto(funcionario.funcao))
    .input("data_admi", sql.Date, texto(dados.data_admi) || String(funcionario.data_admi).slice(0, 10))
    .input("setor", sql.NVarChar(120), texto(dados.setor) || null)
    .input("data_aniversario", sql.Date, dataOuNull(dados.data_aniversario))
    .input("observacao", sql.NVarChar(500), texto(dados.observacao) || null)
    .input("senha_hash", sql.NVarChar(255), senhaHash)
    .input("foto_base64", sql.NVarChar(sql.MAX), texto(dados.foto_base64) || texto(funcionario.foto_base64) || null)
    .query(`
      UPDATE dbo.funcionarios
      SET
        nome_func = @nome_func,
        funcao = @funcao,
        data_admi = @data_admi,
        setor = @setor,
        data_aniversario = @data_aniversario,
        observacao = @observacao,
        senha_hash = @senha_hash,
        foto_base64 = @foto_base64,
        atualizado_em = SYSUTCDATETIME()
      WHERE id_func = @id_func
    `);

  return { status: 200, body: { mensagem: "Funcionario atualizado com sucesso" } };
}

export async function excluirFuncionario(id, cargoSolicitante) {
  await garantirTabelaFuncionarios();
  const cargoAtual = texto(cargoSolicitante).toLowerCase();
  if (!cargoPodeExcluir(cargoAtual)) {
    return { status: 403, body: { mensagem: "Somente dono ou gerente podem excluir funcionario" } };
  }

  const pool = await getPool();
  const resultado = await pool
    .request()
    .input("id_func", sql.NVarChar(4), texto(id))
    .query(`
      DELETE FROM dbo.funcionarios
      OUTPUT DELETED.id_func
      WHERE id_func = @id_func
    `);

  if (resultado.recordset.length === 0) {
    return { status: 404, body: { mensagem: "Funcionario nao encontrado" } };
  }

  return { status: 200, body: { mensagem: "Funcionario excluido com sucesso" } };
}
