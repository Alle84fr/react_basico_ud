import "dotenv/config";

export const env = {
  port: Number(process.env.PORT || 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  otpTtlMinutos: 10,
  resetSenhaTtlMinutos: 30,
  saltRounds: 10,
  dbServer: String(process.env.DB_SERVER || "").trim(),
  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbEncrypt: process.env.DB_ENCRYPT === "true",
  dbTrustCert: process.env.DB_TRUST_CERT !== "false",
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER,
  tokenSecret: process.env.TOKEN_SECRET || process.env.SMTP_PASS || "troque-este-segredo",
};

export function smtpConfigurado() {
  return Boolean(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass);
}

export function dbConfigurado() {
  return Boolean(env.dbServer && env.dbName && env.dbUser && env.dbPassword);
}
