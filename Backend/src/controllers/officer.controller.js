import { Grievance } from "../models/grievance.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notify } from "../services/notification.service.js";

// GET /api/v1/officer/grievances
const getAssignedGrievances = asyncHandler(async (req, res) => {
  // TODO 1: Grievance.find({ assignedOfficer: req.user._id, status: { $in: ["Assigned", "In Progress"] } })
  // TODO 2: sort by priority (Critical first) then sla.resolutionDue ascending
  //         hint: priority is a string, so either map to numbers or sort in JS after fetching
  // TODO 3: populate classification.category (name); include escalationLevel
  // TODO 4: optional ?status= filter to also see Resolved ones
  // TODO 5: return ApiResponse(200, grievances)
  throw new ApiError(501, "getAssignedGrievances not implemented yet");
});

// PATCH /api/v1/officer/grievances/:grievanceId/status
const updateGrievanceStatus = asyncHandler(async (req, res) => {
  // TODO 1: read status ("In Progress") and remark from req.body
  // TODO 2: find grievance by grievanceId; must be assigned to req.user, else 403
  // TODO 3: validate allowed move: Assigned -> In Progress (keep it simple)
  // TODO 4: if sla.firstResponseAt is empty, set it to now (this is the "first response")
  // TODO 5: update status, push history { action: "STATUS_CHANGED", by, note: remark }
  // TODO 6: notify the citizen (type "STATUS")
  // TODO 7: save and return ApiResponse(200, grievance)
  throw new ApiError(501, "updateGrievanceStatus not implemented yet");
});

// POST /api/v1/officer/grievances/:grievanceId/resolve
const resolveGrievance = asyncHandler(async (req, res) => {
  // TODO 1: read resolution note from req.body (required)
  // TODO 2: find grievance; must be assigned to req.user and not already Resolved/Closed
  // TODO 3: set status "Resolved", resolution { note, by, at: now }
  // TODO 4: if firstResponseAt empty, set it now
  // TODO 5: if now > sla.resolutionDue, slaBreached = true (late resolution)
  // TODO 6: push history "RESOLVED", notify the citizen
  // TODO 7: (last) optional proof file -> cloudinary -> resolution.proofUrl
  // TODO 8: save and return ApiResponse(200, grievance)
  throw new ApiError(501, "resolveGrievance not implemented yet");
});

// POST /api/v1/officer/grievances/:grievanceId/reject  (misrouted)
const rejectGrievance = asyncHandler(async (req, res) => {
  // TODO 1: read reason from req.body (required)
  // TODO 2: find grievance; must be assigned to req.user
  // TODO 3: status = "Under Review", assignedOfficer = null
  // TODO 4: push history { action: "REJECTED_MISROUTED", by, note: reason }
  // TODO 5: notify all CGC users (type "ASSIGNED" or "STATUS")
  // TODO 6: save and return ApiResponse(200, {}, "Returned to Central Grievance Cell")
  throw new ApiError(501, "rejectGrievance not implemented yet");
});

export {
  getAssignedGrievances,
  updateGrievanceStatus,
  resolveGrievance,
  rejectGrievance,
};
