const { registerUser } = require('./lib/usersStore.cjs');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
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
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
