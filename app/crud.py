from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import date
from . import models
from .utils import daterange_days, dates_overlap

def create_employee(db: Session, *, name: str, email: str, department: str, joining_date: date, allowance: int = 24):
    existing = db.query(models.Employee).filter(models.Employee.email == email).first()
    if existing:
        raise ValueError("Employee with this email already exists")
    emp = models.Employee(name=name, email=email, department=department, joining_date=joining_date, annual_leave_allowance=allowance)
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp

def get_employee(db: Session, emp_id: int):
    return db.query(models.Employee).filter(models.Employee.id == emp_id).first()

def get_employee_by_email(db: Session, email: str):
    return db.query(models.Employee).filter(models.Employee.email == email).first()

def list_leaves(db: Session, status: str | None = None):
    q = db.query(models.LeaveRequest)
    if status:
        q = q.filter(models.LeaveRequest.status == status)
    return q.order_by(models.LeaveRequest.created_at.desc()).all()

def _ensure_dates_valid(start: date, end: date):
    if start > end:
        raise ValueError("Invalid dates: start_date cannot be after end_date")
    if (end - start).days > 60:
        # anti-abuse guard for MVP
        raise ValueError("Leave duration too long for MVP (> 60 days)")

def apply_leave(db: Session, *, employee_id: int, start_date: date, end_date: date, reason: str | None, leave_type: str):
    emp = get_employee(db, employee_id)
    if not emp:
        raise LookupError("Employee not found")

    _ensure_dates_valid(start_date, end_date)

    if start_date < emp.joining_date:
        raise ValueError("Cannot apply for leave before joining date")

    # overlapping with existing pending/approved leaves
    existing = db.query(models.LeaveRequest).filter(
        models.LeaveRequest.employee_id == employee_id,
        models.LeaveRequest.status.in_([models.LeaveStatus.pending, models.LeaveStatus.approved])
    ).all()
    for lr in existing:
        if dates_overlap(start_date, end_date, lr.start_date, lr.end_date):
            raise ValueError("Overlapping leave request exists")

    days = daterange_days(start_date, end_date)

    # balance check (only count approved leave of same 'annual' bucket)
    used = total_approved_days(db, employee_id)
    if leave_type == "annual" and (used + days) > emp.annual_leave_allowance:
        raise ValueError("Insufficient leave balance")

    leave = models.LeaveRequest(
        employee_id=employee_id,
        start_date=start_date,
        end_date=end_date,
        days=days,
        reason=reason,
        leave_type=leave_type,
        status=models.LeaveStatus.pending
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave

def total_approved_days(db: Session, employee_id: int) -> int:
    from sqlalchemy import func
    total = db.query(func.coalesce(func.sum(models.LeaveRequest.days), 0)).filter(
        models.LeaveRequest.employee_id == employee_id,
        models.LeaveRequest.status == models.LeaveStatus.approved,
        models.LeaveRequest.leave_type == "annual"
    ).scalar()
    return int(total or 0)

def get_balance(db: Session, employee_id: int):
    emp = get_employee(db, employee_id)
    if not emp:
        raise LookupError("Employee not found")
    used = total_approved_days(db, employee_id)
    remaining = max(emp.annual_leave_allowance - used, 0)
    return {"employee_id": employee_id, "allowance": emp.annual_leave_allowance, "used": used, "remaining": remaining}

def decide_leave(db: Session, *, leave_id: int, approve: bool):
    lr = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not lr:
        raise LookupError("Leave request not found")
    if lr.status != models.LeaveStatus.pending:
        raise ValueError("Only pending requests can be decided")

    if approve and lr.leave_type == "annual":
        # re-check balance at decision time
        emp = get_employee(db, lr.employee_id)
        used = total_approved_days(db, lr.employee_id)
        if used + lr.days > emp.annual_leave_allowance:
            raise ValueError("Approval would exceed available balance")

    lr.status = models.LeaveStatus.approved if approve else models.LeaveStatus.rejected
    db.add(lr)
    db.commit()
    db.refresh(lr)
    return lr
