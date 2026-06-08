import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, '../TEST_USER_DATA.sql');
const outPath = path.join(__dirname, '../api/users.json');

function parseSqlString(tuple, startIndex) {
  let value = '';
  let i = startIndex + 1;

  while (i < tuple.length) {
    const ch = tuple[i];
    if (ch === "'" && tuple[i + 1] === "'") {
      value += "'";
      i += 2;
      continue;
    }
    if (ch === "'") {
      return { value, nextIndex: i + 1 };
    }
    value += ch;
    i += 1;
  }

  throw new Error('Unterminated SQL string');
}

function parseTuple(tuple) {
  const fields = [];
  let i = 0;

  while (i < tuple.length) {
    while (i < tuple.length && (tuple[i] === ' ' || tuple[i] === ',')) i += 1;
    if (i >= tuple.length) break;

    if (tuple[i] === "'") {
      const parsed = parseSqlString(tuple, i);
      fields.push(parsed.value);
      i = parsed.nextIndex;
      continue;
    }

    let token = '';
    while (i < tuple.length && tuple[i] !== ',') {
      token += tuple[i];
      i += 1;
    }
    fields.push(token.trim());
  }

  return fields;
}

function parseUsers(sql) {
  const users = [];

  for (const line of sql.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.toLowerCase().startsWith('insert into')) continue;

    const valuesIndex = trimmed.toLowerCase().indexOf('values');
    const start = trimmed.indexOf('(', valuesIndex);
    const end = trimmed.lastIndexOf(')');
    if (start === -1 || end === -1) continue;

    const fields = parseTuple(trimmed.slice(start + 1, end));
    if (fields.length !== 5) continue;

    users.push({
      id: Number(fields[0]),
      first_name: fields[1],
      last_name: fields[2],
      email: fields[3],
      password: fields[4],
      name: `${fields[1]} ${fields[2]}`,
    });
  }

  return users;
}

const sql = fs.readFileSync(sqlPath, 'utf8');
const sqlUsers = parseUsers(sql);
const sqlEmails = new Set(sqlUsers.map((user) => user.email.toLowerCase()));

let customUsers = [];
if (fs.existsSync(outPath)) {
  const existing = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  customUsers = existing.filter((user) => !sqlEmails.has(user.email.toLowerCase()));
}

const users = [...sqlUsers, ...customUsers];
fs.writeFileSync(outPath, JSON.stringify(users, null, 2));
console.log(`Generated ${users.length} users -> api/users.json`);
