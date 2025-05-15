const mysql = require("mysql2/promise");
require("dotenv").config();

// Create database connection pool with optimized settings
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: process.env.DB_POOL_SIZE || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10 seconds
  namedPlaceholders: true,
  dateStrings: true,
});

// Test database connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection established successfully");
    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    // Don't crash the app, but log the error
  }
})();

module.exports = pool;
