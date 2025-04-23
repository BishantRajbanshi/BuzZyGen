const db = require("../config");

// Register new user
const registerUser = async (name, email, password) => {
  const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  await db.execute(query, [name, email, password]);
};

// Find user by email
const findUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = ?";
  const [rows] = await db.execute(query, [email]);
  return rows[0]; // Return the first matching user
};

module.exports = { registerUser, findUserByEmail };
