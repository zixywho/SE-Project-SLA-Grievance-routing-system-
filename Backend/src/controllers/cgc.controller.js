import mongoose from "mongoose";
import { Grievance } from "../models/grievance.model.js";
import { Department } from "../models/department.model.js";
import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { same, addHistory, findGrievanceOrThrow, POPULATE_FULL, CLOSED_STATUSES } from "../utils/grievanceHelpers.js";
import { routeGrievance, reassign } from "../services/routing.service.js";
import { computeSlaDates } from "../services/sla.service.js";
import { PRIORITIES } from "../constants.js";

// GET /api/v1/cgc/review   (Under Review queue, oldest first)
const getReviewQueue = asyncHandler(async (req, res) => {
  const items = await Grievance.find({ status: "Under Review" })
    .populate("classification.department", "name code")
    .populate("classification.category", "name")
    .populate("citizen", "name")
    .sort({ createdAt: 1 });
  return res.status(200).json(new ApiResponse(200, items));
});

// POST /api/v1/cgc/review/:grievanceId
// body (all optional, send nothing to CONFIRM the prediction): { departmentId, categoryId, priority }
const reviewGrievance = asyncHandler(async (req, res) => {
  const { departmentId, categoryId, priority } = req.body ?? {};

  const g = await findGrievanceOrThrow(req.params.grievanceId);
  if (g.status !== "Under Review") {
    throw new ApiError(400, "Only grievances that are Under Review can be reviewed");
  }

  // remember what the model predicted BEFORE changing anything
  const oldDept = g.classification.department;
  const oldCat = g.classification.category;
  const oldPriority = g.classification.priority;

  let newDept = oldDept;
  let newCat = oldCat;
  let newPriority = oldPriority;

  if (departmentId) {
    if (!mongoose.isValidObjectId(departmentId)) throw new ApiError(400, "Invalid departmentId");
    const d = await Department.findById(departmentId);
    if (!d) throw new ApiError(404, "Department not found");
    newDept = d._id;
  }
  if (categoryId) {
    if (!mongoose.isValidObjectId(categoryId)) throw new ApiError(400, "Invalid categoryId");
    const c = await Category.findById(categoryId);
    if (!c) throw new ApiError(404, "Category not found");
    newCat = c._id;
  }
  if (priority) {
    if (!PRIORITIES.includes(priority)) throw new ApiError(400, `priority must be one of: ${PRIORITIES.join(", ")}`);
    newPriority = priority;
  }

  if (!newDept || !newCat) {
    throw new ApiError(400, "This grievance has no valid prediction. Send departmentId and categoryId.");
  }
  const cat = await Category.findById(newCat);
  if (!cat || !same(cat.department, newDept)) {
    throw new ApiError(400, "Category does not belong to the selected department");
  }
  if (!newPriority) newPriority = "Medium";

  const changed =
    !same(newDept, oldDept) || !same(newCat, oldCat) || newPriority !== oldPriority;

  if (changed) {
    // keep the original model prediction (once) for evaluation and retraining
    if (!g.classification.correctedByCGC) {
      g.classification.originalPrediction = { department: oldDept, category: oldCat, priority: oldPriority };
    }
    g.classification.department = newDept;
    g.classification.category = newCat;
    g.classification.priority = newPriority;
    g.classification.correctedByCGC = true;
    g.classification.source = "cgc";

    if (newPriority !== oldPriority) {
      // SLA clock still counts from registration, only the deadlines change
      const dates = await computeSlaDates(newPriority, g.sla.startedAt);
      g.sla.firstResponseDue = dates.firstResponseDue;
      g.sla.resolutionDue = dates.resolutionDue;
    }
    addHistory(g, "CGC_CORRECTED", req.user, "Classification corrected by Central Grievance Cell");
  } else {
    addHistory(g, "CGC_CONFIRMED", req.user, "Classification confirmed by Central Grievance Cell");
  }

  await g.save();
  await routeGrievance(g); // assigns an officer and saves
  await g.populate(POPULATE_FULL);

  const msg = g.status === "Assigned" ? "Reviewed and assigned" : "Reviewed, but no officer is available yet";
  return res.status(200).json(new ApiResponse(200, g, msg));
});

// GET /api/v1/cgc/escalated   (L3 cases still open)
const getEscalatedL3 = asyncHandler(async (req, res) => {
  const items = await Grievance.find({
    escalationLevel: 3,
    status: { $nin: CLOSED_STATUSES },
  })
    .populate("classification.department", "name code")
    .populate("classification.category", "name")
    .populate("assignedOfficer", "name email")
    .sort({ "sla.resolutionDue": 1 });
  return res.status(200).json(new ApiResponse(200, items));
});

// POST /api/v1/cgc/grievances/:grievanceId/reassign
// body: { departmentId?, categoryId?, officerId?, reason? }  (send at least one of departmentId / officerId)
const reassignGrievance = asyncHandler(async (req, res) => {
  const { departmentId, categoryId, officerId, reason } = req.body ?? {};
  if (!departmentId && !officerId) {
    throw new ApiError(400, "Send departmentId and/or officerId");
  }
  const g = await findGrievanceOrThrow(req.params.grievanceId);
  await reassign(g, { departmentId, categoryId, officerId, reason, by: req.user });
  await g.populate(POPULATE_FULL);
  return res.status(200).json(new ApiResponse(200, g, "Grievance reassigned"));
});

export { getReviewQueue, reviewGrievance, getEscalatedL3, reassignGrievance };
