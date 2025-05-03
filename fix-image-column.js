const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixImageColumn() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log('Connected to database');

    // Alter the featured_image column to use LONGTEXT
    const alterQuery = `ALTER TABLE news MODIFY COLUMN featured_image LONGTEXT`;
    
    console.log('Executing query:', alterQuery);
    await connection.query(alterQuery);
    console.log('Featured image column updated to LONGTEXT');

    // Close the connection
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error updating featured_image column:', error);
  }
}

fixImageColumn();
