
import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["sick", "casual", "earned"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, trim: true },
  status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
  adminComment: { type: String, trim: true },
}, { timestamps: true });

leaveSchema.index({ employee: 1, startDate: 1 });

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
