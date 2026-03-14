const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",        // your MySQL username
  password: "",        // empty because no password
  database: "office",    // replace with your database name
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;