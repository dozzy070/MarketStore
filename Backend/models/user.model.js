import pool from '../db/db.js';

export const createUser = async (userData) => {
  const { email, password, fullName, phoneNumber, location, storeDescription } = userData;
  const query = `
    INSERT INTO users (email, password, full_name, phone_number, location, store_description, role)
    VALUES ($1, $2, $3, $4, $5, $6, 'vendor')
    RETURNING id, email, full_name, role
  `;
  const values = [email, password, fullName, phoneNumber, location, storeDescription];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

export const findUserById = async (id) => {
  const query = 'SELECT id, email, full_name, phone_number, location, store_description, role, verified FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const updateUser = async (id, userData) => {
  const { fullName, phoneNumber, location, storeDescription } = userData;
  const query = `
    UPDATE users 
    SET full_name = $1, phone_number = $2, location = $3, store_description = $4
    WHERE id = $5
    RETURNING id, email, full_name, phone_number, location, store_description
  `;
  const values = [fullName, phoneNumber, location, storeDescription, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};