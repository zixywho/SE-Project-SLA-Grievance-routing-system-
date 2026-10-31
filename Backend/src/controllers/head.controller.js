import { Grievance } from "../models/grievance.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { str, addHistory, findGrievanceOrThrow, assertHeadOwns, POPULATE_FULL, CLOSED_STATUSES } from "../utils/grievanceHelpers.js";
import { reassign } from "../services/routing.service.js";
import { computeSlaDates } from "../services/sla.service.js";
import { notify } from "../services/notification.service.js";
import { PRIORITIES } from "../constants.js";

// GET /api/v1/head/escalated   (L2 and L3 cases of the head's own department)
const getEscalatedL2 = asyncHandler(async (req, res) => {
  if (!req.user.department) throw new ApiError(403, "Your account has no department");
  const items = await Grievance.find({
    "classification.department": req.user.department,
    escalationLevel: { $gte: 2 },
    status: { $nin: CLOSED_STATUSES },
  })
    .populate("classification.category", "name")
    .populate("assignedOfficer", "name email")
    .sort({ "sla.resolutionDue": 1 });
  return res.status(200).json(new ApiResponse(200, items));
});

// POST /api/v1/head/grievances/:grievanceId/reassign   body: { officerId, reason? }
const reassignGrievance = asyncHandler(async (req, res) => {
  const { officerId, reason } = req.body ?? {};
  if (!officerId) throw new ApiError(400, "officerId is required");

  const g = await findGrievanceOrThrow(req.params.grievanceId);
  assertHeadOwns(g, req.user);
  // no departmentId passed: a head can only move work inside their own department
  await reassign(g, { officerId, reason, by: req.user });
  await g.populate(POPULATE_FULL);
  return res.status(200).json(new ApiResponse(200, g, "Grievance reassigned"));
});

// PATCH /api/v1/head/grievances/:grievanceId/priority   body: { priority, reason? }
// Decision: the SLA clock keeps its original start (registration time); only the deadlines
// are recomputed for the new priority. Write this rule in your SRS.
const reprioritiseGrievance = asyncHandler(async (req, res) => {
  const priority = str(req.body?.priority);
  const reason = str(req.body?.reason);
  if (!PRIORITIES.includes(priority)) {
    throw new ApiError(400, `priority must be one of: ${PRIORITIES.join(", ")}`);
  }

  const g = await findGrievanceOrThrow(req.params.grievanceId);
  assertHeadOwns(g, req.user);
  if (CLOSED_STATUSES.includes(g.status)) {
    throw new ApiError(400, "A resolved or closed grievance cannot be reprioritised");
  }

  const old = g.classification.priority;
  if (old === priority) throw new ApiError(400, `Priority is already ${priority}`);

  const dates = await computeSlaDates(priority, g.sla.startedAt);
  g.classification.priority = priority;
  g.sla.firstResponseDue = dates.firstResponseDue;
  g.sla.resolutionDue = dates.resolutionDue;
  addHistory(g, "REPRIORITISED", req.user, `${old} -> ${priority}${reason ? " | " + reason : ""}`);
  await g.save();

  await notify(g.assignedOfficer, g, `Priority of ${g.grievanceId} changed to ${priority}`, "STATUS");
  return res.status(200).json(new ApiResponse(200, { grievanceId: g.grievanceId, priority, sla: g.sla }, "Priority updated"));
});

export { getEscalatedL2, reassignGrievance, reprioritiseGrievance };
