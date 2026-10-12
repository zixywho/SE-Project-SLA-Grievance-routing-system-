import mongoose, { Schema } from "mongoose";
import { PRIORITIES } from "../constants.js";

const slaRuleSchema = new Schema(
  {
    priority: { type: String, enum: PRIORITIES, required: true, unique: true },
    firstResponseMinutes: { type: Number, required: true },
    resolutionMinutes: { type: Number, required: true },
  },
  { timestamps: true }
);

export const SlaRule = mongoose.model("SlaRule", slaRuleSchema);