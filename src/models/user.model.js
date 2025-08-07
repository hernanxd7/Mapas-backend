const db = require('../config/db');
const bcrypt = require('bcrypt');

const createUser = async (username, password, role) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = 'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role';
  const values = [username, hashedPassword, role];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getUserByUsername = async (username) => {
  const query = 'SELECT * FROM users WHERE username = $1';
  const result = await db.query(query, [username]);
  return result.rows[0];
};

const getAllDeliveries = async () => {
  const query = 'SELECT id, username, role, status FROM users WHERE role = $1';
  const result = await db.query(query, ['delivery']);
  return result.rows;
};

const updateDeliveryStatus = async (userId, status) => {
  const query = 'UPDATE users SET status = $1 WHERE id = $2 AND role = $3 RETURNING id, username, status';
  const result = await db.query(query, [status, userId, 'delivery']);
  return result.rows[0];
};

module.exports = {
  createUser,
  getUserByUsername,
  getAllDeliveries,
  updateDeliveryStatus
};