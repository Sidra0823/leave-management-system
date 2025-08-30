# API Endpoints - Sample Input / Output

Base URL: http://localhost:3000

## 1. Add Employee
POST /employees
Request:
{
  "name": "Sidra Ahmed",
  "email": "sidra@example.com",
  "department": "Engineering",
  "joiningDate": "2025-01-15"
}
Response:
{
  "message": "Employee added",
  "employee": { "id": 1, "name": "Sidra Ahmed", ... }
}

## 2. Get Employees
GET /employees
Response:
[ { "id":1, "name":"Sidra Ahmed", "email":"..." } ]

## 3. Apply Leave
POST /leaves/apply
Request:
{
  "emp_id": 1,
  "start_date": "2025-09-10",
  "end_date": "2025-09-12",
  "type": "ANNUAL",
  "reason": "Family function"
}
Response:
{ "message": "Leave request created", "leave": { "id": 1, "status": "PENDING" } }

## 4. Approve Leave
PUT /leaves/approve/:leaveId
Response:
{ "message": "Approved", "leave": { ... } }

## 5. Reject Leave
PUT /leaves/reject/:leaveId
Response:
{ "message": "Rejected", "leave": { ... } }

## 6. Get Leave Balance
GET /leaves/balance/:empId
Response:
{ "emp_id": 1, "total_leaves": 20, "used_leaves": 3, "remaining_leaves": 17 }

## Notes
- See backend code for full validation rules.
