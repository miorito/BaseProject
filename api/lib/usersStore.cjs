const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '../users.json');
const tmpFile = '/tmp/baseproject-users.json';

let users = null;

function getWritablePath() {
  if (process.env.VERCEL) {
    return tmpFile;
  }
  return usersFile;
}

function loadUsers() {
  if (users) return users;

  const writablePath = getWritablePath();

  if (fs.existsSync(writablePath)) {
    users = JSON.parse(fs.readFileSync(writablePath, 'utf8'));
    return users;
  }

  users = require('../users.json');
  saveUsers();
  return users;
}

function saveUsers() {
  const data = JSON.stringify(users, null, 2);
  fs.writeFileSync(getWritablePath(), data);

  if (!process.env.VERCEL) {
    fs.writeFileSync(usersFile, data);
  }
}

function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return loadUsers().find((user) => user.email.toLowerCase() === normalized) ?? null;
}

function registerUser({ first_name, last_name, email, password }) {
  const list = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (list.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return { error: 'Email already registered' };
  }

  const nextId = list.reduce((max, user) => Math.max(max, user.id), 0) + 1;
  const trimmedFirst = first_name.trim();
  const trimmedLast = last_name.trim();

  const user = {
    id: nextId,
    first_name: trimmedFirst,
    last_name: trimmedLast,
    email: normalizedEmail,
    password,
    name: `${trimmedFirst} ${trimmedLast}`,
  };

  list.push(user);
  users = list;
  saveUsers();

  return { user };
}

module.exports = {
  findUserByEmail,
  registerUser,
};
