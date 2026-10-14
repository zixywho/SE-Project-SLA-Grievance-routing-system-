import { SlaRule } from "../models/slaRule.model.js";

// Returns { startedAt, firstResponseDue, resolutionDue }
const computeSlaDates = async (priority, startedAt = new Date()) => {
  // TODO 1: rule = await SlaRule.findOne({ priority })
  // TODO 2: if no rule, throw an error (seed data missing)
  // TODO 3: firstResponseDue = startedAt + rule.firstResponseMinutes * 60 * 1000
  //         resolutionDue    = startedAt + rule.resolutionMinutes * 60 * 1000
  // TODO 4: return the three dates (the caller saves them into grievance.sla)
  // NOTE: this is async, so use `await computeSlaDates(...)` in controllers
  throw new Error("computeSlaDates not implemented yet");
};

export { computeSlaDates };
