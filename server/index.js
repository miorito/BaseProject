import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { findUserByEmail, registerUser } = require('../api/lib/usersStore.cjs');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

app.post('/api/login', (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = findUserByEmail(email);

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  return res.json({
    success: true,
    message: 'Login successful',
    user: { email: user.email, name: user.name },
  });
});

app.post('/api/register', (req, res) => {
  const { first_name, last_name, email, password } = req.body ?? {};

  if (!first_name?.trim() || !last_name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const result = registerUser({ first_name, last_name, email, password });

  if (result.error) {
    return res.status(409).json({ success: false, message: result.error });
  }

  return res.status(201).json({
    success: true,
    message: 'Registration successful',
    user: { email: result.user.email, name: result.user.name },
  });
});

if (isProduction) {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
