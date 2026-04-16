import { dbConfigurado } from "../config/env.js";
import {
  atualizarAnimal,
  buscarAnimalPorId,
  criarAnimal,
  excluirAnimal,
  listarAnimais,
} from "../services/animalService.js";

function validarBanco(res) {
  if (!dbConfigurado()) {
    res.status(500).json({ mensagem: "Banco SQL Server nao configurado" });
    return false;
  }

  return true;
}

export async function listarTodosAnimais(_req, res) {
  if (!validarBanco(res)) return;

  try {
    const resultado = await listarAnimais();
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao listar animais",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}

export async function buscarAnimal(req, res) {
  if (!validarBanco(res)) return;

  try {
    const resultado = await buscarAnimalPorId(req.params.id);
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao buscar animal",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}

export async function cadastrarAnimal(req, res) {
  if (!validarBanco(res)) return;

  try {
    const resultado = await criarAnimal(req.body || {});
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao cadastrar animal",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}

export async function atualizarFichaAnimal(req, res) {
  if (!validarBanco(res)) return;

  try {
    const resultado = await atualizarAnimal(req.params.id, req.body || {});
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao atualizar animal",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}

export async function deletarAnimal(req, res) {
  if (!validarBanco(res)) return;

  try {
    const resultado = await excluirAnimal(req.params.id, req.body?.cargoSolicitante);
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao excluir animal",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}
