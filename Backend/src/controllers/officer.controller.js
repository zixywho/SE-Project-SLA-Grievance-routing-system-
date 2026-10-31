import { Grievance } from "../models/grievance.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  str, same, addHistory, findGrievanceOrThrow, PRIORITY_RANK, OPEN_WORK_STATUSES,
} from "../utils/grievanceHelpers.js";
import { notify, notifyRole } from "../services/notification.service.js";
import { STATUSES } from "../constants.js";

const assertAssignedToMe = (g, user) => {
  if (!same(g.assignedOfficer, user._id)) {
    throw new ApiError(403, "This grievance is not assigned to you");
  }
};

// GET /api/v1/officer/grievances   (?status=Resolved to see finished ones)
const getAssignedGrievances = asyncHandler(async (req, res) => {
  let statuses = OPEN_WORK_STATUSES;
  if (req.query.status) {
    if (!STATUSES.includes(req.query.status)) throw new ApiError(400, "Invalid status filter");
    statuses = [req.query.status];
  }

  const items = await Grievance.find({
    assignedOfficer: req.user._id,
    status: { $in: statuses },
  })
    .populate("classification.category", "name")
    .populate("citizen", "name")
    .lean();

  // Critical first, then earliest resolution deadline
  items.sort((a, b) => {
    const pa = PRIORITY_RANK[a.classification?.priority] ?? 9;
    const pb = PRIORITY_RANK[b.classification?.priority] ?? 9;
    if (pa !== pb) return pa - pb;
    return new Date(a.sla?.resolutionDue ?? 0) - new Date(b.sla?.resolutionDue ?? 0);
  });

  return res.status(200).json(new ApiResponse(200, items));
});

// PATCH /api/v1/officer/grievances/:grievanceId/status   body: { status: "In Progress", remark }
const updateGrievanceStatus = asyncHandler(async (req, res) => {
  const body = req.body ?? {};
  const status = str(body.status);
  const remark = str(body.remark);

  if (status !== "In Progress") throw new ApiError(400, 'status must be "In Progress"');

  const g = await findGrievanceOrThrow(req.params.grievanceId);
  assertAssignedToMe(g, req.user);
  if (!OPEN_WORK_STATUSES.includes(g.status)) {
    throw new ApiError(400, `Cannot update a grievance that is ${g.status}`);
  }

  const wasAssigned = g.status === "Assigned";
  g.status = "In Progress";
  if (!g.sla.firstResponseAt) g.sla.firstResponseAt = new Date(); // stops the "first response missed" reminder
  addHistory(g, wasAssigned ? "STATUS_CHANGED" : "REMARK_ADDED", req.user, remark || "Work started");
  await g.save();

  if (wasAssigned) {
    await notify(g.citizen, g, `Your grievance ${g.grievanceId} is now In Progress`, "STATUS");
  }
  return res.status(200).json(new ApiResponse(200, { grievanceId: g.grievanceId, status: g.status }, "Status updated"));
});

// POST /api/v1/officer/grievances/:grievanceId/resolve   body: { note }
const resolveGrievance = asyncHandler(async (req, res) => {
  const note = str(req.body?.note);
  if (!note) throw new ApiError(400, "A resolution note is required");

  const g = await findGrievanceOrThrow(req.params.grievanceId);
  assertAssignedToMe(g, req.user);
  if (!OPEN_WORK_STATUSES.includes(g.status)) {
    throw new ApiError(400, `Cannot resolve a grievance that is ${g.status}`);
  }

  const now = new Date();
  g.status = "Resolved";
  g.resolution = { note, by: req.user._id, at: now };
  if (!g.sla.firstResponseAt) g.sla.firstResponseAt = now;
  if (g.sla.resolutionDue && now > new Date(g.sla.resolutionDue)) g.slaBreached = true;
  addHistory(g, "RESOLVED", req.user, note);
  await g.save();

  await notify(g.citizen, g, `Your grievance ${g.grievanceId} has been resolved`, "STATUS");
  return res.status(200).json(new ApiResponse(200, { grievanceId: g.grievanceId, status: g.status, slaBreached: g.slaBreached }, "Grievance resolved"));
});

// POST /api/v1/officer/grievances/:grievanceId/reject   body: { reason }
const rejectGrievance = asyncHandler(async (req, res) => {
  const reason = str(req.body?.reason);
  if (!reason) throw new ApiError(400, "A reason is required to reject a grievance");

  const g = await findGrievanceOrThrow(req.params.grievanceId);
  assertAssignedToMe(g, req.user);
  if (!OPEN_WORK_STATUSES.includes(g.status)) {
    throw new ApiError(400, `Cannot reject a grievance that is ${g.status}`);
  }

  g.status = "Under Review";
  g.assignedOfficer = null;
  addHistory(g, "REJECTED_MISROUTED", req.user, reason);
  await g.save();

  await notifyRole("cgc", g, `${g.grievanceId} was rejected by an officer as misrouted: ${reason}`, "ASSIGNED");
  return res.status(200).json(new ApiResponse(200, { grievanceId: g.grievanceId, status: g.status }, "Returned to Central Grievance Cell"));
});

export { getAssignedGrievances, updateGrievanceStatus, resolveGrievance, rejectGrievance };
