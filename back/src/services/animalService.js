import { getPool, sql } from "../config/db.js";

function texto(valor) {
  return String(valor || "").trim();
}

function dataOuNull(valor) {
  return valor ? String(valor).trim() : null;
}

function numeroOuNull(valor) {
  if (valor === "" || valor === null || valor === undefined) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function cargoPodeExcluir(cargo) {
  return cargo === "dono" || cargo === "gerente";
}

async function garantirTabelaAnimais() {
  const pool = await getPool();

  await pool.request().query(`
    IF OBJECT_ID('dbo.animais', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.animais (
        id_animal NVARCHAR(4) NOT NULL
          CONSTRAINT PK_animais PRIMARY KEY,
        nome_animal NVARCHAR(120) NOT NULL,
        raca NVARCHAR(120) NULL,
        funcao NVARCHAR(120) NULL,
        data_nascimento DATE NULL,
        data_aquisicao DATE NULL,
        peso DECIMAL(10,2) NULL,
        cuidador NVARCHAR(120) NULL,
        observacao NVARCHAR(500) NULL,
        vacinas NVARCHAR(MAX) NULL,
        foto_base64 NVARCHAR(MAX) NULL,
        criado_em DATETIME2(0) NOT NULL
          CONSTRAINT DF_animais_criado_em DEFAULT SYSUTCDATETIME(),
        atualizado_em DATETIME2(0) NOT NULL
          CONSTRAINT DF_animais_atualizado_em DEFAULT SYSUTCDATETIME()
      );
    END
  `);
}

async function gerarProximoId(pool) {
  const resultado = await pool.request().query(`
    SELECT MAX(CAST(RIGHT(id_animal, 3) AS INT)) AS ultimo_numero
    FROM dbo.animais
    WHERE id_animal LIKE 'A[0-9][0-9][0-9]'
  `);

  const ultimoNumero = Number(resultado.recordset[0]?.ultimo_numero || 0) + 1;
  return `A${String(ultimoNumero).padStart(3, "0")}`;
}

function validarCamposObrigatorios({ nome_animal }) {
  if (!texto(nome_animal)) {
    return "Nome do animal e obrigatorio";
  }

  return null;
}

function mapearAnimal(registro) {
  return {
    id: registro.id_animal,
    nome: registro.nome_animal,
    raca: registro.raca || "",
    funcao: registro.funcao || "",
    dataNascimento: registro.data_nascimento,
    dataAquisicao: registro.data_aquisicao,
    peso: registro.peso ?? "",
    cuidador: registro.cuidador || "",
    observacao: registro.observacao || "",
    vacinas: registro.vacinas || "",
    foto: registro.foto_base64 || "",
  };
}

export async function listarAnimais() {
  await garantirTabelaAnimais();
  const pool = await getPool();

  const resultado = await pool.request().query(`
    SELECT
      id_animal,
      nome_animal,
      raca,
      funcao,
      data_nascimento,
      data_aquisicao,
      peso,
      cuidador,
      observacao,
      vacinas,
      foto_base64
    FROM dbo.animais
    ORDER BY nome_animal ASC
  `);

  return {
    status: 200,
    body: {
      animais: resultado.recordset.map(mapearAnimal),
    },
  };
}

export async function buscarAnimalPorId(id) {
  await garantirTabelaAnimais();
  const pool = await getPool();

  const resultado = await pool
    .request()
    .input("id_animal", sql.NVarChar(4), texto(id))
    .query(`
      SELECT
        id_animal,
        nome_animal,
        raca,
        funcao,
        data_nascimento,
        data_aquisicao,
        peso,
        cuidador,
        observacao,
        vacinas,
        foto_base64
      FROM dbo.animais
      WHERE id_animal = @id_animal
    `);

  const animal = resultado.recordset[0];
  if (!animal) {
    return { status: 404, body: { mensagem: "Animal nao encontrado" } };
  }

  return {
    status: 200,
    body: {
      animal: mapearAnimal(animal),
    },
  };
}

export async function criarAnimal(dados) {
  await garantirTabelaAnimais();
  const erroValidacao = validarCamposObrigatorios(dados);
  if (erroValidacao) {
    return { status: 400, body: { mensagem: erroValidacao } };
  }

  const pool = await getPool();
  const nomeNormalizado = texto(dados.nome_animal).toLowerCase();

  const duplicado = await pool
    .request()
    .input("nome_busca", sql.NVarChar(120), nomeNormalizado)
    .query(`
      SELECT TOP 1 id_animal
      FROM dbo.animais
      WHERE LOWER(nome_animal) = @nome_busca
    `);

  if (duplicado.recordset.length > 0) {
    return { status: 409, body: { mensagem: `Animal ${texto(dados.nome_animal)} ja cadastrado` } };
  }

  const idAnimal = await gerarProximoId(pool);

  await pool
    .request()
    .input("id_animal", sql.NVarChar(4), idAnimal)
    .input("nome_animal", sql.NVarChar(120), texto(dados.nome_animal))
    .input("raca", sql.NVarChar(120), texto(dados.raca) || null)
    .input("funcao", sql.NVarChar(120), texto(dados.funcao) || null)
    .input("data_nascimento", sql.Date, dataOuNull(dados.data_nascimento))
    .input("data_aquisicao", sql.Date, dataOuNull(dados.data_aquisicao))
    .input("peso", sql.Decimal(10, 2), numeroOuNull(dados.peso))
    .input("cuidador", sql.NVarChar(120), texto(dados.cuidador) || null)
    .input("observacao", sql.NVarChar(500), texto(dados.observacao) || null)
    .input("vacinas", sql.NVarChar(sql.MAX), texto(dados.vacinas) || null)
    .input("foto_base64", sql.NVarChar(sql.MAX), texto(dados.foto_base64) || null)
    .query(`
      INSERT INTO dbo.animais (
        id_animal,
        nome_animal,
        raca,
        funcao,
        data_nascimento,
        data_aquisicao,
        peso,
        cuidador,
        observacao,
        vacinas,
        foto_base64
      )
      VALUES (
        @id_animal,
        @nome_animal,
        @raca,
        @funcao,
        @data_nascimento,
        @data_aquisicao,
        @peso,
        @cuidador,
        @observacao,
        @vacinas,
        @foto_base64
      )
    `);

  return {
    status: 201,
    body: {
      mensagem: "Animal cadastrado com sucesso",
      id: idAnimal,
    },
  };
}

export async function atualizarAnimal(id, dados) {
  await garantirTabelaAnimais();
  const pool = await getPool();
  const idInformado = texto(id);

  const resultado = await pool
    .request()
    .input("id_animal", sql.NVarChar(4), idInformado)
    .query(`
      SELECT
        id_animal,
        nome_animal,
        raca,
        funcao,
        data_nascimento,
        data_aquisicao,
        peso,
        cuidador,
        observacao,
        vacinas,
        foto_base64
      FROM dbo.animais
      WHERE id_animal = @id_animal
    `);

  const animal = resultado.recordset[0];
  if (!animal) {
    return { status: 404, body: { mensagem: "Animal nao encontrado" } };
  }

  await pool
    .request()
    .input("id_animal", sql.NVarChar(4), idInformado)
    .input("nome_animal", sql.NVarChar(120), texto(dados.nome_animal) || texto(animal.nome_animal))
    .input("raca", sql.NVarChar(120), texto(dados.raca) || null)
    .input("funcao", sql.NVarChar(120), texto(dados.funcao) || null)
    .input("data_nascimento", sql.Date, dataOuNull(dados.data_nascimento))
    .input("data_aquisicao", sql.Date, dataOuNull(dados.data_aquisicao))
    .input("peso", sql.Decimal(10, 2), numeroOuNull(dados.peso))
    .input("cuidador", sql.NVarChar(120), texto(dados.cuidador) || null)
    .input("observacao", sql.NVarChar(500), texto(dados.observacao) || null)
    .input("vacinas", sql.NVarChar(sql.MAX), texto(dados.vacinas) || null)
    .input("foto_base64", sql.NVarChar(sql.MAX), texto(dados.foto_base64) || texto(animal.foto_base64) || null)
    .query(`
      UPDATE dbo.animais
      SET
        nome_animal = @nome_animal,
        raca = @raca,
        funcao = @funcao,
        data_nascimento = @data_nascimento,
        data_aquisicao = @data_aquisicao,
        peso = @peso,
        cuidador = @cuidador,
        observacao = @observacao,
        vacinas = @vacinas,
        foto_base64 = @foto_base64,
        atualizado_em = SYSUTCDATETIME()
      WHERE id_animal = @id_animal
    `);

  return { status: 200, body: { mensagem: "Animal atualizado com sucesso" } };
}

export async function excluirAnimal(id, cargoSolicitante) {
  const cargoAtual = texto(cargoSolicitante).toLowerCase();
  if (!cargoPodeExcluir(cargoAtual)) {
    return { status: 403, body: { mensagem: "Somente dono ou gerente podem excluir animal" } };
  }

  await garantirTabelaAnimais();
  const pool = await getPool();
  const resultado = await pool
    .request()
    .input("id_animal", sql.NVarChar(4), texto(id))
    .query(`
      DELETE FROM dbo.animais
      OUTPUT DELETED.id_animal
      WHERE id_animal = @id_animal
    `);

  if (resultado.recordset.length === 0) {
    return { status: 404, body: { mensagem: "Animal nao encontrado" } };
  }

  return { status: 200, body: { mensagem: "Animal excluido com sucesso" } };
}
