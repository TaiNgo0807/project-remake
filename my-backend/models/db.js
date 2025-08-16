const mysql = require("mysql2/promise");
const { URL } = require("url");

if (!process.env.MYSQL_URL) {
  throw new Error("❌ Missing MYSQL_URL in environment variables");
}
const dbUrl = new URL(process.env.MYSQL_URL);

const ca = process.env.DB_SSL_CA_B64
  ? Buffer.from(process.env.DB_SSL_CA_B64, "base64").toString("utf8")
  : process.env.DB_SSL_CA || undefined;

const pool = mysql.createPool({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace("/", ""),
  port: dbUrl.port || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: ca ? { ca, minVersion: "TLSv1.2" } : undefined,
});

module.exports = pool;
