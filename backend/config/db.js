/**
 * Database configuration and payment logging
 */

import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "../payment_performance.db");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Помилка підключення до SQLite:", err);
  } else {
    console.log("SQLite база підключена:", DB_PATH);
  }
});

// Створення таблиці
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS payment_performance (
      payment_id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      duration_ms INTEGER NOT NULL
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_provider ON payment_performance(provider)`);
});

/**
 * Log payment performance to database
 */
export function logPayment(provider, paymentId, durationMs) {
  if (!provider || !paymentId || durationMs == null) {
    console.error("[Payment Log] Помилка: неповні дані для логування");
    return;
  }

  db.run(
    `INSERT OR REPLACE INTO payment_performance 
     (payment_id, provider, duration_ms)
     VALUES (?, ?, ?)`,
    [paymentId, provider, durationMs],
    function (err) {
      if (err) {
        console.error("Помилка запису в SQLite:", err.message);
      } else {
        console.log(`[Payment Log] ${provider} | ${paymentId} | ${durationMs}ms`);
      }
    }
  );
}

export default db;
