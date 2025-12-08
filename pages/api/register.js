import { connectDB } from '../../lib/db';
import User from '../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: 'Please fill all the fields' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hash,
    });

    await user.save();

    return res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.log('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
