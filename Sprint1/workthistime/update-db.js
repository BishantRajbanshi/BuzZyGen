const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDatabase() {
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

    // Get table information
    const [tables] = await connection.query('SHOW TABLES');
    if (tables.length === 0) {
      console.log('No tables found. Creating schema from scratch...');
      await createSchema(connection);
      return;
    }

    // Check if news table exists
    const [columns] = await connection.query('SHOW COLUMNS FROM news');
    console.log('Current columns in news table:', columns.map(c => c.Field).join(', '));

    // Check for each column we need
    const columnNames = columns.map(col => col.Field);
    
    // Prepare alter statements
    const alterStatements = [];
    
    // Check for subtitle column
    if (!columnNames.includes('subtitle')) {
      alterStatements.push('ADD COLUMN subtitle VARCHAR(255)');
    }
    
    // Check for tags column
    if (!columnNames.includes('tags')) {
      alterStatements.push('ADD COLUMN tags VARCHAR(255)');
    }
    
    // Check for featured_image column
    if (!columnNames.includes('featured_image')) {
      if (columnNames.includes('imageUrl')) {
        alterStatements.push('CHANGE COLUMN imageUrl featured_image VARCHAR(255)');
      } else {
        alterStatements.push('ADD COLUMN featured_image VARCHAR(255)');
      }
    }
    
    // Execute alter statements if needed
    if (alterStatements.length > 0) {
      const alterQuery = `ALTER TABLE news ${alterStatements.join(', ')}`;
      console.log('Executing:', alterQuery);
      await connection.query(alterQuery);
      console.log('Database schema updated successfully');
    } else {
      console.log('Database schema is already up to date');
    }

    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error updating database:', error);
  }
}

async function createSchema(connection) {
  try {
    await connection.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('user', 'admin') DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
      
      -- News table
      CREATE TABLE IF NOT EXISTS news (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255),
          content TEXT,
          featured_image VARCHAR(255),
          category VARCHAR(50),
          tags VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
      
      -- Create admin user (password: admin123)
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin', 'admin@newsportal.com', '$2a$10$ZVtYxCsmmFk0WGWJlZJP7ec6EUtNIGaPW4WiqsFH4rksy2qQMaKhO', 'admin')
      ON DUPLICATE KEY UPDATE role = 'admin';
    `);
    console.log('Schema created successfully');
  } catch (error) {
    console.error('Error creating schema:', error);
  }
}

updateDatabase();
