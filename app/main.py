from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from . import models, schemas, crud

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mini Leave Management System (Python)",
              version="1.0.0",
              description="APIs for Employees, Leaves, Balance, with basic validations and edge-case handling.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health():
    return {"ok": True}

# Employees
@app.post("/employees", response_model=schemas.EmployeeOut, status_code=201)
def add_employee(payload: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    try:
        emp = crud.create_employee(db,
            name=payload.name,
            email=payload.email,
            department=payload.department,
            joining_date=payload.joining_date,
            allowance=payload.annual_leave_allowance)
        return emp
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/employees/{emp_id}", response_model=schemas.EmployeeOut)
def get_employee(emp_id: int, db: Session = Depends(get_db)):
    emp = crud.get_employee(db, emp_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@app.get("/employees/{emp_id}/balance", response_model=schemas.BalanceOut)
def get_balance(emp_id: int, db: Session = Depends(get_db)):
    try:
        return crud.get_balance(db, emp_id)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))

# Leaves
@app.post("/leaves", response_model=schemas.LeaveOut, status_code=201)
def apply_leave(payload: schemas.LeaveApply, db: Session = Depends(get_db)):
    try:
        lr = crud.apply_leave(db,
                              employee_id=payload.employee_id,
                              start_date=payload.start_date,
                              end_date=payload.end_date,
                              reason=payload.reason,
                              leave_type=payload.leave_type)
        return lr
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/leaves/{leave_id}/decision", response_model=schemas.LeaveOut)
def decide_leave(leave_id: int, payload: schemas.LeaveDecision, db: Session = Depends(get_db)):
    try:
        lr = crud.decide_leave(db, leave_id=leave_id, approve=payload.approve)
        return lr
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/leaves", response_model=list[schemas.LeaveOut])
def list_leaves(status: models.LeaveStatus | None = Query(default=None), db: Session = Depends(get_db)):
    items = crud.list_leaves(db, status=status.value if status else None)
    return items
