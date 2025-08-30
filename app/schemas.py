from pydantic import BaseModel, EmailStr, field_validator
from datetime import date
from typing import Optional, Literal

class EmployeeCreate(BaseModel):
    name: str
    email: EmailStr
    department: str
    joining_date: date
    annual_leave_allowance: int = 24

    @field_validator("annual_leave_allowance")
    @classmethod
    def validate_allowance(cls, v):
        if v < 0 or v > 365:
            raise ValueError("annual_leave_allowance must be between 0 and 365")
        return v

class EmployeeOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    department: str
    joining_date: date
    annual_leave_allowance: int
    class Config:
        from_attributes = True

class LeaveApply(BaseModel):
    employee_id: int
    start_date: date
    end_date: date
    reason: Optional[str] = None
    leave_type: Literal["annual","sick","casual","unpaid"] = "annual"

class LeaveDecision(BaseModel):
    approve: bool
    note: Optional[str] = None  # reserved for future

class LeaveOut(BaseModel):
    id: int
    employee_id: int
    start_date: date
    end_date: date
    days: int
    leave_type: str
    status: str
    reason: Optional[str]
    class Config:
        from_attributes = True

class BalanceOut(BaseModel):
    employee_id: int
    allowance: int
    used: int
    remaining: int
