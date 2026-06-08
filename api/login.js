import { initDb, findUserByEmail } from './lib/users.js';

const ready = initDb();

export default async function handler(req, res) {
  await ready;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = findUserByEmail(email.trim());

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    user: { email: user.email, name: user.name },
  });
}
