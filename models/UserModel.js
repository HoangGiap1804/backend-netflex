import pool from '../config/db.js';

const findUserByUsername = async (username) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0];
};

const createUser = async (username, hashedPassword) => {
  const [result] = await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
  const userId = result.insertId;

  const [row] = await pool.query('SELECT id, username FROM users WHERE id = ?', [userId]);
  
  return row[0];
};

const findUserById = async (id) => {
  const [rows] = await pool.query('SELECT id, username FROM users WHERE id = ?', [id]);
  return rows[0];
};

export default { findUserByUsername, createUser, findUserById };

