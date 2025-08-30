
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Enforce foreign key constraints
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');

  // --- Tables ---
  db.run(`CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT,
    joining_date TEXT
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    reason TEXT,
    applied_on TEXT DEFAULT (date('now')),
    FOREIGN KEY(emp_id) REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS leave_balances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id INTEGER NOT NULL UNIQUE,
    total_leaves INTEGER NOT NULL DEFAULT 20,
    used_leaves INTEGER NOT NULL DEFAULT 0,
    remaining_leaves INTEGER NOT NULL DEFAULT 20,
    FOREIGN KEY(emp_id) REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE
  );`);

  // --- Indexes ---
  db.run(`CREATE INDEX IF NOT EXISTS idx_leave_requests_emp_id ON leave_requests(emp_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_leave_requests_period ON leave_requests(start_date, end_date);`);
});

// Small promise helpers
function prepare(query) {
  return {
    run: (...params) => new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) reject(err);
        else resolve({ lastInsertRowid: this.lastID, changes: this.changes });
      });
    }),
    get: (...params) => new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    }),
    all: (...params) => new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    })
  };
}

module.exports = prepare;
