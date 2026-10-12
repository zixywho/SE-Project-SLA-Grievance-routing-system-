import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    grievance: { type: Schema.Types.ObjectId, ref: "Grievance" },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["ACK", "STATUS", "ASSIGNED", "REMINDER", "ESCALATION"],
      default: "STATUS",
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);