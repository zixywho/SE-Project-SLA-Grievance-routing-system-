import mongoose from "mongoose";
import { Grievance } from "../models/grievance.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CLOSED_STATUSES } from "../utils/grievanceHelpers.js";

// Head -> own department only. CGC/admin -> everything, or ?department=<id> to filter.
const buildMatch = (req) => {
  const match = {};
  if (req.user.role === "head") {
    if (!req.user.department) throw new ApiError(403, "Your account has no department");
    match["classification.department"] = req.user.department;
  } else if (req.query.department) {
    if (!mongoose.isValidObjectId(req.query.department)) throw new ApiError(400, "Invalid department id");
    match["classification.department"] = new mongoose.Types.ObjectId(req.query.department);
  }
  return match;
};

// adds departmentName using _id.department
const deptLookup = [
  { $lookup: { from: "departments", localField: "_id.department", foreignField: "_id", as: "dept" } },
  { $addFields: { departmentName: { $ifNull: [{ $arrayElemAt: ["$dept.name", 0] }, "Unassigned"] } } },
  { $project: { dept: 0 } },
];

const round1 = (n) => Math.round(n * 10) / 10;

// SLA compliance among RESOLVED/CLOSED grievances: resolved on or before the resolution deadline
const complianceRows = async (match, byDept) => {
  const rows = await Grievance.aggregate([
    { $match: { ...match, status: { $in: CLOSED_STATUSES }, "resolution.at": { $exists: true } } },
    {
      $group: {
        _id: byDept ? { department: "$classification.department" } : null,
        total: { $sum: 1 },
        onTime: { $sum: { $cond: [{ $lte: ["$resolution.at", "$sla.resolutionDue"] }, 1, 0] } },
      },
    },
    ...(byDept ? deptLookup : []),
  ]);
  return rows.map((r) => ({
    department: r.departmentName ?? "All",
    resolvedTotal: r.total,
    resolvedOnTime: r.onTime,
    compliancePercent: r.total ? round1((r.onTime / r.total) * 100) : null,
  }));
};

// Average time from registration to resolution, in minutes
const resolutionRows = async (match, byDept) => {
  const rows = await Grievance.aggregate([
    { $match: { ...match, status: { $in: CLOSED_STATUSES }, "resolution.at": { $exists: true } } },
    {
      $group: {
        _id: byDept ? { department: "$classification.department" } : null,
        count: { $sum: 1 },
        avgMs: { $avg: { $subtract: ["$resolution.at", "$createdAt"] } },
      },
    },
    ...(byDept ? deptLookup : []),
  ]);
  return rows.map((r) => ({
    department: r.departmentName ?? "All",
    resolvedCount: r.count,
    avgResolutionMinutes: round1(r.avgMs / 60000),
  }));
};

// GET /api/v1/reports/summary
const getSummary = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const [counts] = await Grievance.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $in: ["$status", CLOSED_STATUSES] }, 1, 0] } },
        underReview: { $sum: { $cond: [{ $eq: ["$status", "Under Review"] }, 1, 0] } },
        escalatedL2: { $sum: { $cond: [{ $eq: ["$escalationLevel", 2] }, 1, 0] } },
        escalatedL3: { $sum: { $cond: [{ $eq: ["$escalationLevel", 3] }, 1, 0] } },
        slaBreached: { $sum: { $cond: ["$slaBreached", 1, 0] } },
        correctedByCGC: { $sum: { $cond: ["$classification.correctedByCGC", 1, 0] } },
      },
    },
  ]);

  const base = counts ?? { total: 0, resolved: 0, underReview: 0, escalatedL2: 0, escalatedL3: 0, slaBreached: 0, correctedByCGC: 0 };
  const { _id, ...numbers } = base;
  const [compliance] = await complianceRows(match, false);
  const [resolution] = await resolutionRows(match, false);

  return res.status(200).json(
    new ApiResponse(200, {
      ...numbers,
      open: numbers.total - numbers.resolved,
      slaCompliancePercent: compliance?.compliancePercent ?? null,
      avgResolutionMinutes: resolution?.avgResolutionMinutes ?? null,
    })
  );
});

// GET /api/v1/reports/by-department
const getByDepartmentAndStatus = asyncHandler(async (req, res) => {
  const rows = await Grievance.aggregate([
    { $match: buildMatch(req) },
    { $group: { _id: { department: "$classification.department", status: "$status" }, count: { $sum: 1 } } },
    ...deptLookup,
    { $project: { _id: 0, department: "$departmentName", status: "$_id.status", count: 1 } },
    { $sort: { department: 1, status: 1 } },
  ]);
  return res.status(200).json(new ApiResponse(200, rows));
});

// GET /api/v1/reports/sla-compliance
const getSlaCompliance = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, await complianceRows(buildMatch(req), true)));
});

// GET /api/v1/reports/resolution-time
const getResolutionTime = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, await resolutionRows(buildMatch(req), true)));
});

// GET /api/v1/reports/escalations
const getEscalationCounts = asyncHandler(async (req, res) => {
  const rows = await Grievance.aggregate([
    { $match: buildMatch(req) },
    { $group: { _id: { department: "$classification.department", level: "$escalationLevel" }, count: { $sum: 1 } } },
    ...deptLookup,
    { $project: { _id: 0, department: "$departmentName", level: "$_id.level", count: 1 } },
    { $sort: { department: 1, level: 1 } },
  ]);
  return res.status(200).json(new ApiResponse(200, rows));
});

export { getSummary, getByDepartmentAndStatus, getSlaCompliance, getResolutionTime, getEscalationCounts };
