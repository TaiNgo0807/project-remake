const mysql = require("mysql2/promise");
const { URL } = require("url");

if (!process.env.MYSQL_URL) {
  throw new Error("❌ Missing MYSQL_URL in environment variables");
}
const dbUrl = new URL(process.env.MYSQL_URL);

const pool = mysql.createPool({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace("/", ""),
  port: dbUrl.port || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
