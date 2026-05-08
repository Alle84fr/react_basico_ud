import { dbConfigurado } from "../config/env.js";
import {
  atualizarFuncionario,
  buscarFuncionarioPorId,
  criarFuncionario,
  excluirFuncionario,
  listarFuncionarios,
} from "../services/funcionarioService.js";

function validarBanco(res) {
  if (!dbConfigurado()) {
    res.status(500).json({ mensagem: "Banco SQL Server nao configurado" });
    return false;
  }

  return true;
}

export async function listarTodosFuncionarios(_req, res) {
  if (!validarBanco(res)) return;

  try {
    const resultado = await listarFuncionarios();
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao listar funcionarios",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}

export async function buscarFuncionario(req, res) {
  if (!validarBanco(res)) return;

  try {
    const resultado = await buscarFuncionarioPorId(req.params.id);
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao buscar funcionario",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}

export async function cadastrarFuncionario(req, res) {
  if (!validarBanco(res)) return;

  try {
    const resultado = await criarFuncionario(req.body || {});
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao cadastrar funcionario",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}

export async function atualizarFichaFuncionario(req, res) {
  if (!validarBanco(res)) return;

  try {
    const resultado = await atualizarFuncionario(req.params.id, req.body || {});
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao atualizar funcionario",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}

export async function deletarFuncionario(req, res) {
  if (!validarBanco(res)) return;

  try {
    const resultado = await excluirFuncionario(req.params.id, req.body?.cargoSolicitante);
    return res.status(resultado.status).json(resultado.body);
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Falha ao excluir funcionario",
      detalhe: erro?.message || "Erro desconhecido",
    });
  }
}
