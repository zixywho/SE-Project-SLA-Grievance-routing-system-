import { Grievance } from "../models/grievance.model.js";
import { Department } from "../models/department.model.js";
import { Category } from "../models/category.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { routeGrievance } from "../services/routing.service.js";
import { computeSlaDates } from "../services/sla.service.js";
import { notify } from "../services/notification.service.js";

// GET /api/v1/cgc/review
const getReviewQueue = asyncHandler(async (req, res) => {
  // TODO 1: Grievance.find({ status: "Under Review" })
  // TODO 2: populate classification.department and category
  // TODO 3: sort oldest first (createdAt ascending)
  // TODO 4: return ApiResponse(200, grievances)
  //         (frontend shows the predicted label, confidence and the description)
  throw new ApiError(501, "getReviewQueue not implemented yet");
});

// POST /api/v1/cgc/review/:grievanceId  (confirm or correct)
const reviewGrievance = asyncHandler(async (req, res) => {
  // TODO 1: read departmentId, categoryId, priority from req.body
  //         (if all are omitted, treat it as "confirm the existing prediction")
  // TODO 2: find grievance; status must be "Under Review", else ApiError(400)
  // TODO 3: if anything differs from the current classification:
  //            save the old values to classification.originalPrediction
  //            set classification.correctedByCGC = true, source = "cgc"
  //            (this stored correction is the data for retraining the model later)
  // TODO 4: if priority changed, recompute SLA dates with computeSlaDates(priority)
  // TODO 5: push history { action: "CGC_REVIEWED", by: req.user._id }
  // TODO 6: await routeGrievance(grievance)  (assigns an officer, status "Assigned")
  // TODO 7: return ApiResponse(200, grievance)
  throw new ApiError(501, "reviewGrievance not implemented yet");
});

// GET /api/v1/cgc/escalated
const getEscalatedL3 = asyncHandler(async (req, res) => {
  // TODO 1: Grievance.find({ escalationLevel: 3, status: { $nin: ["Resolved", "Closed"] } })
  // TODO 2: populate department, assignedOfficer
  // TODO 3: return ApiResponse(200, grievances)
  throw new ApiError(501, "getEscalatedL3 not implemented yet");
});

// POST /api/v1/cgc/grievances/:grievanceId/reassign
const reassignGrievance = asyncHandler(async (req, res) => {
  // TODO 1: read departmentId (optional) and officerId (optional) + reason from req.body
  // TODO 2: if departmentId given and different: update classification.department,
  //         then pick a new officer in that department (routing.service pickOfficer)
  // TODO 3: if only officerId given: verify that officer exists, role "officer",
  //         and belongs to the grievance's department
  // TODO 4: update assignedOfficer, status "Assigned"
  // TODO 5: push history { action: "REASSIGNED", by, note: reason }
  // TODO 6: notify the new officer
  // TODO 7: return ApiResponse(200, grievance)
  throw new ApiError(501, "reassignGrievance not implemented yet");
});

export { getReviewQueue, reviewGrievance, getEscalatedL3, reassignGrievance };
