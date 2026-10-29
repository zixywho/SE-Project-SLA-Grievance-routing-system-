import { SlaRule } from "../models/slaRule.model.js";
import { ApiError } from "../utils/ApiError.js";

// Returns { startedAt, firstResponseDue, resolutionDue } for a priority.
// Async because the durations come from the database (slarules collection).
const computeSlaDates = async (priority, startedAt = new Date()) => {
  const rule = await SlaRule.findOne({ priority });
  if (!rule) {
    throw new ApiError(500, `SLA rule missing for priority "${priority}". Run: npm run seed`);
  }
  const start = new Date(startedAt);
  return {
    startedAt: start,
    firstResponseDue: new Date(start.getTime() + rule.firstResponseMinutes * 60 * 1000),
    resolutionDue: new Date(start.getTime() + rule.resolutionMinutes * 60 * 1000),
  };
};

export { computeSlaDates };