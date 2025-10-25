import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'mini-notion.db');
const db = new Database(dbPath);

// Enable WAL mode for better write performance
db.pragma('journal_mode = WAL');

// Initialize the database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS blocks (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    style TEXT,
    width INTEGER,
    height INTEGER
  )
`);

export default db;
