const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, '../database.db'));
    this.init();
  }

  init() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        session_name TEXT,
        interface_name TEXT,
        filter_expression TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `;

    this.db.run(createUsersTable);
    this.db.run(createSessionsTable);
  }

  async createUser(username, password, email) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
      stmt.run([username, hashedPassword, email], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, username, email });
      });
      stmt.finalize();
    });
  }

  async findUser(username) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async saveSession(userId, sessionName, interfaceName, filterExpression) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare("INSERT INTO sessions (user_id, session_name, interface_name, filter_expression) VALUES (?, ?, ?, ?)");
      stmt.run([userId, sessionName, interfaceName, filterExpression], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
      stmt.finalize();
    });
  }
}

module.exports = Database;