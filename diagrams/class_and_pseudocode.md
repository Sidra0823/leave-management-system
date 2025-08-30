# Class / Module Design & Pseudocode

## Modules
- EmployeeService
  - addEmployee(data)
  - listEmployees()

- LeaveService
  - applyLeave(data)
  - approveLeave(leaveId)
  - rejectLeave(leaveId)
  - listLeaves()

- BalanceService
  - getBalance(empId)
  - adjustBalance(empId, days)

## Pseudocode for approveLeave
function approveLeave(leaveId):
    leave = LeaveRequest.findById(leaveId)
    if leave.status != "PENDING":
        return "Already processed"

    balance = LeaveBalance.findByEmpId(leave.emp_id)
    requestedDays = calculateDays(leave.start_date, leave.end_date)

    if balance.remaining < requestedDays:
        leave.status = "REJECTED"
        save(leave)
        return "Rejected - Insufficient balance"

    leave.status = "APPROVED"
    balance.used += requestedDays
    balance.remaining -= requestedDays
    save(leave)
    save(balance)
    return "Approved"
