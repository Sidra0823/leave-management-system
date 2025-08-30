
-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT,
  joining_date TEXT
);

-- Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  emp_id INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  type TEXT NOT NULL,            -- ANNUAL | SICK | CASUAL (free text in MVP)
  status TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING | APPROVED | REJECTED
  reason TEXT,
  applied_on TEXT DEFAULT (date('now')),
  FOREIGN KEY(emp_id) REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Leave Balances (1:1 per employee)
CREATE TABLE IF NOT EXISTS leave_balances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  emp_id INTEGER NOT NULL UNIQUE,
  total_leaves INTEGER NOT NULL DEFAULT 20,
  used_leaves INTEGER NOT NULL DEFAULT 0,
  remaining_leaves INTEGER NOT NULL DEFAULT 20,
  FOREIGN KEY(emp_id) REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leave_requests_emp_id ON leave_requests(emp_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_period ON leave_requests(start_date, end_date);
