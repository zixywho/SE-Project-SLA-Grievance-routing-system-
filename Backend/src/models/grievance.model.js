import mongoose, { Schema } from "mongoose";
import { PRIORITIES, STATUSES } from "../constants.js";

const historySchema = new Schema(
  {
    action: { type: String, required: true }, // SUBMITTED, CLASSIFIED, ASSIGNED, ESCALATED_L2 ...
    by: { type: Schema.Types.ObjectId, ref: "User" }, // empty when the system acts
    note: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const grievanceSchema = new Schema(
  {
    grievanceId: { type: String, unique: true, index: true },
    citizen: { type: Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    location: {
      district: { type: String, required: true, trim: true },
      ward: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    attachments: [{ filename: String, url: String, mimetype: String }],

    classification: {
      department: { type: Schema.Types.ObjectId, ref: "Department" },
      category: { type: Schema.Types.ObjectId, ref: "Category" },
      priority: { type: String, enum: PRIORITIES },
      confidence: { type: Number, min: 0, max: 1 },
      source: { type: String, enum: ["ml", "keyword", "cgc"], default: "ml" },
      correctedByCGC: { type: Boolean, default: false },
      originalPrediction: {
        department: { type: Schema.Types.ObjectId, ref: "Department" },
        category: { type: Schema.Types.ObjectId, ref: "Category" },
        priority: { type: String, enum: PRIORITIES },
      },
    },

    status: { type: String, enum: STATUSES, default: "Submitted" },
    assignedOfficer: { type: Schema.Types.ObjectId, ref: "User" },

    sla: {
      startedAt: { type: Date, default: Date.now },
      firstResponseDue: Date,
      resolutionDue: Date,
      firstResponseAt: Date,
      reminderSent: { type: Boolean, default: false },
    },
    escalationLevel: { type: Number, enum: [1, 2, 3], default: 1 },
    slaBreached: { type: Boolean, default: false },

    resolution: {
      note: String,
      proofUrl: String,
      by: { type: Schema.Types.ObjectId, ref: "User" },
      at: Date,
    },

    history: [historySchema],
  },
  { timestamps: true }
);

grievanceSchema.index({ status: 1, escalationLevel: 1 });
grievanceSchema.index({ assignedOfficer: 1, status: 1 });
grievanceSchema.index({ "classification.department": 1, status: 1 });

export const Grievance = mongoose.model("Grievance", grievanceSchema);