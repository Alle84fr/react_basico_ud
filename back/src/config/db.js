import sql from "mssql";
import { env } from "./env.js";

const temInstanciaNomeada = env.dbServer.includes("\\");
const [dbHost, dbInstanceName] = env.dbServer.split("\\");

const dbConfig = {
  server: temInstanciaNomeada ? dbHost : env.dbServer,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword,
  options: {
    encrypt: env.dbEncrypt,
    trustServerCertificate: env.dbTrustCert,
    ...(temInstanciaNomeada ? { instanceName: dbInstanceName } : {}),
  },
  ...(temInstanciaNomeada ? {} : { port: Number(process.env.DB_PORT || 1433) }),
};

let poolPromise;

export async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig);
  }

  return poolPromise;
}

export { sql };
