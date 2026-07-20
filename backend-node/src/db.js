const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'hr_app',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hr',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_SIZE || 10)
});

async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function ping() {
  await query('SELECT 1 AS ok', []);
}

module.exports = { pool, query, ping };
