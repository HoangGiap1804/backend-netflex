import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserModel from '../models/UserModel.js';
import dotenv from 'dotenv';
dotenv.config();

const register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Username and password are required" });
  }

  try {
    const user = await UserModel.findUserByUsername(username);
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await UserModel.createUser(username, hashed);

    const token = jwt.sign({ user: { id: newUser.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username
      },
      token
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findUserByUsername(username);
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch {
    res.status(500).send('Server error');
  }
};

const getProfile = async (req, res) => {
  const user = await UserModel.findUserById(req.user.id);
  res.json(user);
};

export default {
  register,
  login,
  getProfile
};
