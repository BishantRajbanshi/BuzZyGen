const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

async function applyMigration() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true // Allow multiple SQL statements
    });

    console.log('Connected to database');

    // Read migration SQL
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add_google_auth_fields.sql'),
      'utf8'
    );

    console.log('Migration SQL loaded:');
    console.log(migrationSQL);

    // Execute migration
    console.log('Applying migration...');
    await connection.query(migrationSQL);
    console.log('Migration applied successfully');

    // Close connection
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration();
