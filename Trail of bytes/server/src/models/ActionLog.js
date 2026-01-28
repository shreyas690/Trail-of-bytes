import mongoose from "mongoose";

const actionLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    action: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ActionLog = mongoose.model("ActionLog", actionLogSchema);

export default ActionLog;

