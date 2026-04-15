const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock user store for MVP phase 1
// In Phase 2, this will be moved to PostgreSQL
const MOCK_USERS = [
  {
    id: 1,
    email: 'director@apexsync.com',
    password: 'password123', // Will be hashed in real scenario
    role: 'director_of_performance',
    name: 'Director Jane',
  },
  {
    id: 2,
    email: 'rehab@apexsync.com',
    password: 'password123',
    role: 'rehab_lead',
    name: 'Lead Mark',
  },
];

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // In a real scenario, this would be a query to public.users JOIN public.organizations
    const user = MOCK_USERS.find((u) => u.email === email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Adding organization slug to the token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        name: user.name,
        org_slug: user.email.includes('raptors') ? 'raptors' : 'public' 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};
