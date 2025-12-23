import { connectDB } from '../../lib/db';
import User from '../../public/models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Please enter email and password' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(400)
        .json({ message: 'Invalid email or password' });
    }

    
    return res.status(200).json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
