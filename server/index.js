import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

const DEMO_USER = {
  email: 'user@example.com',
  password: 'password123',
};

app.use(cors());
app.use(express.json());

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    return res.json({
      success: true,
      message: 'Login successful',
      user: { email },
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid email or password' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
