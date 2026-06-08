import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'app.db');
const sqlPath = process.env.USER_DATA_SQL_PATH || path.join(__dirname, '../TEST_USER_DATA.sql');

let db;

function persist() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

function seedFromSqlFile() {
  db.run(`
    CREATE TABLE IF NOT EXISTS TEST_USER_DATA (
      id INTEGER PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);

  const result = db.exec('SELECT COUNT(*) AS count FROM TEST_USER_DATA');
  const count = result[0]?.values[0]?.[0] ?? 0;
  if (count > 0) return;

  if (!fs.existsSync(sqlPath)) {
    throw new Error(`User seed file not found: ${sqlPath}`);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  db.exec(sql);
  persist();
  console.log(`Seeded users from ${path.basename(sqlPath)}`);
}

export async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    db = new SQL.Database(fs.readFileSync(dbPath));
  } else {
    db = new SQL.Database();
  }

  seedFromSqlFile();
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
