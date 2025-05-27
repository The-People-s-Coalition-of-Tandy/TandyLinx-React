import Database from "better-sqlite3";

const db = new Database('tandylinx.db', { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pageTitle TEXT UNIQUE NOT NULL,
    pageURL TEXT UNIQUE NOT NULL,
    links TEXT NOT NULL,
    style TEXT DEFAULT 'default',
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

console.log('Database initialized successfully.');
db.close();


// ALTER TABLE links ADD COLUMN pagePhotoUrl TEXT;
