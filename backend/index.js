const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const prepare = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

/*
Simple Leave Management API - async sqlite wrapper
*/

async function insertEmployee(name,email,department,joiningDate){
  const info = await prepare('INSERT INTO employees (name,email,department,joining_date) VALUES (?,?,?,?)').run(name,email,department,joiningDate);
  return info.lastInsertRowid;
}

// Add employee
app.post('/employees', async (req, res) => {
  try {
    const { name, email, department, joiningDate } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email required' });
    const empId = await insertEmployee(name,email,department || '', joiningDate || null);
    // initialize balance
    await prepare('INSERT INTO leave_balances (emp_id,total_leaves,used_leaves,remaining_leaves) VALUES (?,?,?,?)').run(empId,20,0,20);
    const emp = await prepare('SELECT * FROM employees WHERE id=?').get(empId);
    res.json({ message: 'Employee added', employee: emp });
  } catch(err){ console.error(err); res.status(500).json({error: String(err)}); }
});

// list employees
app.get('/employees', async (req, res) => {
  const rows = await prepare('SELECT * FROM employees').all();
  res.json(rows);
});

// apply leave
app.post('/leaves/apply', async (req, res) => {
  try {
    const { emp_id, start_date, end_date, type, reason } = req.body;
    if (!emp_id || !start_date || !end_date) return res.status(400).json({ error: 'emp_id, start_date, end_date required' });
    const sd = new Date(start_date); const ed = new Date(end_date);
    if (isNaN(sd) || isNaN(ed) || ed < sd) return res.status(400).json({ error: 'invalid dates' });
    const info = await prepare('INSERT INTO leave_requests (emp_id,start_date,end_date,type,status,reason,applied_on) VALUES (?,?,?,?,?,?,datetime("now"))').run(emp_id, start_date, end_date, type || 'ANNUAL', 'PENDING', reason || '');
    const leave = await prepare('SELECT * FROM leave_requests WHERE id=?').get(info.lastInsertRowid);
    res.json({ message: 'Leave request created', leave });
  } catch(err){ console.error(err); res.status(500).json({error: String(err)}); }
});

// approve leave
app.put('/leaves/approve/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const leave = await prepare('SELECT * FROM leave_requests WHERE id=?').get(id);
    if (!leave) return res.status(404).json({ error: 'not found' });
    if (leave.status !== 'PENDING') return res.json({ message: 'Already processed', leave });
    const sd = new Date(leave.start_date); const ed = new Date(leave.end_date);
    const days = Math.ceil((ed - sd)/(1000*60*60*24)) + 1;
    const balance = await prepare('SELECT * FROM leave_balances WHERE emp_id=?').get(leave.emp_id);
    if (!balance) return res.status(500).json({ error: 'balance missing' });
    if (balance.remaining_leaves < days) {
      await prepare('UPDATE leave_requests SET status=? WHERE id=?').run('REJECTED', id);
      const updated = await prepare('SELECT * FROM leave_requests WHERE id=?').get(id);
      return res.json({ message: 'Rejected - Insufficient balance', leave: updated });
    }
    await prepare('UPDATE leave_requests SET status=? WHERE id=?').run('APPROVED', id);
    await prepare('UPDATE leave_balances SET used_leaves = used_leaves + ?, remaining_leaves = remaining_leaves - ? WHERE emp_id=?').run(days, days, leave.emp_id);
    const updated = await prepare('SELECT lr.*, lb.remaining_leaves FROM leave_requests lr JOIN leave_balances lb ON lr.emp_id=lb.emp_id WHERE lr.id=?').get(id);
    res.json({ message: 'Approved', leave: updated });
  } catch(err){ console.error(err); res.status(500).json({error: String(err)}); }
});

// reject leave
app.put('/leaves/reject/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const leave = await prepare('SELECT * FROM leave_requests WHERE id=?').get(id);
    if (!leave) return res.status(404).json({ error: 'not found' });
    if (leave.status !== 'PENDING') return res.json({ message: 'Already processed', leave });
    await prepare('UPDATE leave_requests SET status=? WHERE id=?').run('REJECTED', id);
    const updated = await prepare('SELECT * FROM leave_requests WHERE id=?').get(id);
    res.json({ message: 'Rejected', leave: updated });
  } catch(err){ console.error(err); res.status(500).json({error: String(err)}); }
});

// get leave balance
app.get('/leaves/balance/:empId', async (req, res) => {
  const empId = req.params.empId;
  const bal = await prepare('SELECT * FROM leave_balances WHERE emp_id=?').get(empId);
  if (!bal) return res.status(404).json({ error: 'not found' });
  res.json(bal);
});

// list leave requests
app.get('/leaves', async (req, res) => {
  const rows = await prepare('SELECT * FROM leave_requests').all();
  res.json(rows);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server listening on', PORT));
