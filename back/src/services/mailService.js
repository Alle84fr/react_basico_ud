
//biblioteca do Node.js para enviar e-mail pelo cód
import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// configurar servidor de e-mail
const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

export async function enviarOtpPorEmail({ nome, email, otp, validadeMinutos }) {
  await transporter.sendMail({
    from: env.smtpFrom,
    to: email,
    subject: "Codigo OTP - Confirmacao de cadastro",
    text: `Ola, ${nome}!

Seu codigo de confirmacao (OTP): ${otp}

Validade: ${validadeMinutos} minutos.

Se nao foi voce, desconsidere este e-mail.`,
    html: `
      <h2>Codigo OTP</h2>
      <p>Ola, <strong>${nome}</strong>!</p>
      <p>Seu codigo de confirmacao (OTP) e:</p>
      <p style="font-size:20px;"><strong>${otp}</strong></p>
      <p>Validade: ${validadeMinutos} minutos.</p>
      <p>Se nao foi voce, desconsidere este e-mail.</p>
    `,
  });
}

export async function enviarRecuperacaoSenhaPorEmail({ nome, email, linkRecuperacao }) {
  await transporter.sendMail({
    from: env.smtpFrom,
    to: email,
    subject: "Recuperacao de senha",
    text: `Ola, ${nome}!

Recebemos um pedido para recuperar sua senha.

Se voce ainda lembra da senha antiga, pode continuar usando normalmente.
Se quiser redefinir, abra este link:
${linkRecuperacao}

Se nao quiser redefinir, basta ignorar este e-mail.`,
    html: `
      <h2>Recuperacao de senha</h2>
      <p>Ola, <strong>${nome}</strong>!</p>
      <p>Recebemos um pedido para recuperar sua senha.</p>
      <p>Se voce ainda lembra da senha antiga, pode continuar usando normalmente.</p>
      <p>Para redefinir sua senha, clique no link abaixo:</p>
      <p><a href="${linkRecuperacao}">${linkRecuperacao}</a></p>
      <p>Se nao quiser redefinir, basta ignorar este e-mail.</p>
    `,
  });
}
