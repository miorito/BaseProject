import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath =
  process.env.USER_DATA_SQL_PATH || path.join(__dirname, '../../TEST_USER_DATA.sql');

let db;

export async function initDb() {
  if (db) return;

  const SQL = await initSqlJs();
  db = new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS TEST_USER_DATA (
      id INTEGER PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);

  if (!fs.existsSync(sqlPath)) {
    throw new Error(`User seed file not found: ${sqlPath}`);
  }

  db.exec(fs.readFileSync(sqlPath, 'utf8'));
}

export function findUserByEmail(email) {
  const stmt = db.prepare(`
    SELECT id, first_name, last_name, email, password
    FROM TEST_USER_DATA
    WHERE LOWER(email) = ?
  `);
  stmt.bind([email.toLowerCase()]);

  if (!stmt.step()) {
    stmt.free();
    return null;
  }

  const row = stmt.getAsObject();
  stmt.free();

  return {
    ...row,
    name: `${row.first_name} ${row.last_name}`,
  };
}
