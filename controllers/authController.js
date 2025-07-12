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

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username
      },
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Username and password are required" });
  }

  try {
    const user = await UserModel.findUserByUsername(username);
    if (!user) return res.status(401).json({ msg: 'Cannot find username' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Incorrect password' });

    const accessToken = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '1m' });
    const refreshToken = jwt.sign({ user: { id: user.id } }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7m' });

    res.status(200).json({ 
      message: "logined in successfully",
      user: {
        id: user.id,
        username: user.username
      },
      accessToken: accessToken,
      refreshToken: refreshToken
    });
  } catch {
    res.status(500).send('Server error');
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ msg: 'No refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { user: { id: decoded.user.id } },
      process.env.JWT_SECRET,
      { expiresIn: '1m' }
    );
    const newRefreshToken = jwt.sign({ user: { id: decoded.user.id } }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7m' });

    res.status(200).json({ 
      message: "Token refreshed successfully",
      user: {
        id: decoded.user.id,
      },
      accessToken: accessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid refresh token', error: err.message });
  }
};

const getProfile = async (req, res) => {
  const user = await UserModel.findUserById(req.user.id);
  res.json(user);
};

export default {
  register,
  login,
  refresh,
  getProfile
};
