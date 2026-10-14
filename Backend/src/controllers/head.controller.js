import { Grievance } from "../models/grievance.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { computeSlaDates } from "../services/sla.service.js";
import { notify } from "../services/notification.service.js";

// GET /api/v1/head/escalated
const getEscalatedL2 = asyncHandler(async (req, res) => {
  // TODO 1: Grievance.find({
  //           "classification.department": req.user.department,
  //           escalationLevel: { $gte: 2 },
  //           status: { $nin: ["Resolved", "Closed"] }
  //         })
  // TODO 2: populate assignedOfficer, category; sort by sla.resolutionDue
  // TODO 3: return ApiResponse(200, grievances)
  throw new ApiError(501, "getEscalatedL2 not implemented yet");
});

// POST /api/v1/head/grievances/:grievanceId/reassign
const reassignGrievance = asyncHandler(async (req, res) => {
  // TODO 1: read officerId + reason from req.body
  // TODO 2: grievance must be in the head's own department, else 403
  // TODO 3: new officer must be an active "officer" of the same department
  // TODO 4: update assignedOfficer, push history { action: "REASSIGNED_BY_HEAD", by, note }
  // TODO 5: notify the new officer and the old officer
  // TODO 6: return ApiResponse(200, grievance)
  throw new ApiError(501, "reassignGrievance not implemented yet");
});

// PATCH /api/v1/head/grievances/:grievanceId/priority
const reprioritiseGrievance = asyncHandler(async (req, res) => {
  // TODO 1: read priority from req.body; validate it is in PRIORITIES
  // TODO 2: grievance must be in the head's own department
  // TODO 3: update classification.priority
  // TODO 4: recompute the SLA dates from NOW or keep startedAt? (decide and note it in your SRS)
  // TODO 5: push history { action: "REPRIORITISED", by, note: "High -> Critical" }
  // TODO 6: notify the assigned officer
  // TODO 7: return ApiResponse(200, grievance)
  throw new ApiError(501, "reprioritiseGrievance not implemented yet");
});

export { getEscalatedL2, reassignGrievance, reprioritiseGrievance };
