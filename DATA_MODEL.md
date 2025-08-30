
# Part 1 — Data Modelling

## ER Diagram
See: `diagrams/er_diagram.png` (also included as `ER_Diagram_Clean_Attractive.png`).

**Relationships**
- **Employee (1) — (N) LeaveRequest**
- **Employee (1) — (1) LeaveBalance**

## Tables

### employees
| Column        | Type    | Constraints                 |
|---------------|---------|-----------------------------|
| id            | INTEGER | PK, AUTOINCREMENT           |
| name          | TEXT    | NOT NULL                    |
| email         | TEXT    | NOT NULL, UNIQUE            |
| department    | TEXT    |                             |
| joining_date  | TEXT    |                             |

### leave_requests
| Column     | Type    | Constraints                                                                |
|------------|---------|----------------------------------------------------------------------------|
| id         | INTEGER | PK, AUTOINCREMENT                                                          |
| emp_id     | INTEGER | NOT NULL, FK → employees(id) ON DELETE CASCADE ON UPDATE CASCADE           |
| start_date | TEXT    | NOT NULL                                                                   |
| end_date   | TEXT    | NOT NULL                                                                   |
| type       | TEXT    | NOT NULL (ANNUAL/SICK/CASUAL — free text in MVP)                           |
| status     | TEXT    | NOT NULL DEFAULT 'PENDING'                                                 |
| reason     | TEXT    |                                                                            |
| applied_on | TEXT    | DEFAULT date('now')                                                        |

### leave_balances
| Column            | Type    | Constraints                                                                |
|-------------------|---------|----------------------------------------------------------------------------|
| id                | INTEGER | PK, AUTOINCREMENT                                                          |
| emp_id            | INTEGER | NOT NULL, UNIQUE, FK → employees(id) ON DELETE CASCADE ON UPDATE CASCADE   |
| total_leaves      | INTEGER | NOT NULL DEFAULT 20                                                        |
| used_leaves       | INTEGER | NOT NULL DEFAULT 0                                                         |
| remaining_leaves  | INTEGER | NOT NULL DEFAULT 20                                                        |

## Keys, Relationships, Indexes

- **Primary Keys:** `employees.id`, `leave_requests.id`, `leave_balances.id`
- **Foreign Keys:** 
  - `leave_requests.emp_id` → `employees.id` (cascade delete/update)
  - `leave_balances.emp_id` → `employees.id` (cascade delete/update)
- **Unique Constraints:**
  - `employees.email`
  - `leave_balances.emp_id` (1:1 mapping)
- **Indexes:**
  - `idx_leave_requests_emp_id` on `leave_requests(emp_id)`
  - `idx_leave_requests_status` on `leave_requests(status)`
  - `idx_leave_requests_period` on `leave_requests(start_date, end_date)`

## How to apply schema manually (optional)
From the `backend` folder:
```bash
sqlite3 database.sqlite < schema.sql
```
Or rely on automatic table creation in `backend/db.js` (runs on server start).
