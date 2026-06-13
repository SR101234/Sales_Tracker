const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost", // replace with your MySQL host
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",        // your MySQL username
  password: process.env.DB_PASSWORD || "",        // empty because no password
  database: process.env.DB_NAME || "office",    // replace with your database name
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;