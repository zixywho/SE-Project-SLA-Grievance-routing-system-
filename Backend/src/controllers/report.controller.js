import { Grievance } from "../models/grievance.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Shared TODO for ALL report endpoints:
//   build a $match stage first:
//     - head  -> { "classification.department": req.user.department }  (own department ONLY)
//     - cgc / admin -> {} (all departments)
//   then add the $group stages below.

// GET /api/v1/reports/summary
const getSummary = asyncHandler(async (req, res) => {
  // TODO 1: total grievances, open count, resolved count, escalated count
  // TODO 2: SLA compliance % and average resolution time (reuse the logic below)
  // TODO 3: return one object with all the numbers (for the dashboard cards)
  throw new ApiError(501, "getSummary not implemented yet");
});

// GET /api/v1/reports/by-department
const getByDepartmentAndStatus = asyncHandler(async (req, res) => {
  // TODO: Grievance.aggregate([
  //   { $match },
  //   { $group: { _id: { department: "$classification.department", status: "$status" }, count: { $sum: 1 } } },
  //   { $lookup: departments } to show names instead of ids
  // ])
  throw new ApiError(501, "getByDepartmentAndStatus not implemented yet");
});

// GET /api/v1/reports/sla-compliance
const getSlaCompliance = asyncHandler(async (req, res) => {
  // TODO: among Resolved/Closed grievances, compliance % =
  //       (count where slaBreached == false and resolution.at <= sla.resolutionDue) / total * 100
  //       group per department
  throw new ApiError(501, "getSlaCompliance not implemented yet");
});

// GET /api/v1/reports/resolution-time
const getResolutionTime = asyncHandler(async (req, res) => {
  // TODO: for Resolved grievances: avg of (resolution.at - createdAt) using $avg + $subtract
  //       per department, convert ms to minutes or hours
  throw new ApiError(501, "getResolutionTime not implemented yet");
});

// GET /api/v1/reports/escalations
const getEscalationCounts = asyncHandler(async (req, res) => {
  // TODO: count grievances grouped by escalationLevel (1, 2, 3), per department
  throw new ApiError(501, "getEscalationCounts not implemented yet");
});

export {
  getSummary,
  getByDepartmentAndStatus,
  getSlaCompliance,
  getResolutionTime,
  getEscalationCounts,
};
