'use strict';

const mysql = require('mysql2/promise');
const { config } = require('../config');

let pool = null;

function getPool() {
  if (pool) return pool;
  pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    connectionLimit: config.db.connectionLimit,
    waitForConnections: true,
    namedPlaceholders: true,
    charset: 'utf8mb4',
    timezone: 'Z',
  });
  return pool;
}

async function query(sql, params) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

async function closePool() {
  if (pool) {
    const p = pool;
    pool = null;
    await p.end();
  }
}

module.exports = { getPool, query, closePool };
