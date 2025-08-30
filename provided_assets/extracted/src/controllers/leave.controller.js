
import Leave from "../models/Leave.js";
import User from "../models/User.js";

const daysBetween = (start, end) => {
  const diff = Math.ceil((new Date(end).setHours(0,0,0,0) - new Date(start).setHours(0,0,0,0)) / (1000*60*60*24)) + 1;
  return diff;
};

export const createLeave = async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;
  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ message: "startDate cannot be after endDate" });
  }
  const overlap = await Leave.findOne({
    employee: req.user._id,
    status: { $in: ["pending", "approved"] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
    ]
  });
  if (overlap) return res.status(400).json({ message: "Overlapping leave exists" });

  const leave = await Leave.create({
    employee: req.user._id,
    type, startDate, endDate, reason
  });
  res.status(201).json({ leave });
};

export const myLeaves = async (req, res) => {
  const leaves = await Leave.find({ employee: req.user._id }).sort({ createdAt: -1 });
  res.json({ leaves });
};

export const cancelLeave = async (req, res) => {
  const { id } = req.params;
  const leave = await Leave.findOne({ _id: id, employee: req.user._id });
  if (!leave) return res.status(404).json({ message: "Leave not found" });
  if (leave.status !== "pending") return res.status(400).json({ message: "Only pending leaves can be cancelled" });
  leave.status = "cancelled";
  await leave.save();
  res.json({ message: "Leave cancelled", leave });
};

export const listAllLeaves = async (req, res) => {
  const { status, type, employee } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (employee) filter.employee = employee;

  const leaves = await Leave.find(filter).populate("employee", "name email role").sort({ createdAt: -1 });
  res.json({ leaves });
};

export const updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminComment } = req.body;
  const allowed = ["approved", "rejected"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const leave = await Leave.findById(id).populate("employee");
  if (!leave) return res.status(404).json({ message: "Leave not found" });
  if (leave.status !== "pending") return res.status(400).json({ message: "Only pending leaves can be updated" });

  if (status === "approved") {
    const days = daysBetween(leave.startDate, leave.endDate);
    const user = await User.findById(leave.employee._id);
    if (user.leaveBalance[leave.type] < days) {
      return res.status(400).json({ message: `Insufficient ${leave.type} leave balance` });
    }
    user.leaveBalance[leave.type] -= days;
    await user.save();
  }

  leave.status = status;
  if (adminComment) leave.adminComment = adminComment;
  await leave.save();
  res.json({ message: "Leave updated", leave });
};
