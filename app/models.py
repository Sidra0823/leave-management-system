from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import enum

class LeaveStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False)
    joining_date = Column(Date, nullable=False)
    annual_leave_allowance = Column(Integer, default=24, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    leaves = relationship("LeaveRequest", back_populates="employee", cascade="all, delete-orphan")

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), index=True, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    days = Column(Integer, nullable=False)
    reason = Column(Text, nullable=True)
    leave_type = Column(String, default="annual")  # extensible
    status = Column(Enum(LeaveStatus), default=LeaveStatus.pending, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee = relationship("Employee", back_populates="leaves")
