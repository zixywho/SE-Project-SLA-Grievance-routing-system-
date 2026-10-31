import { Grievance } from "../models/grievance.model.js";
import { Department } from "../models/department.model.js";
import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateGrievanceId } from "../utils/generateGrievanceId.js";
import {
  str, same, addHistory, findGrievanceOrThrow, canViewGrievance, POPULATE_FULL,
} from "../utils/grievanceHelpers.js";
import { classifyGrievance } from "../services/classifier.service.js";
import { routeGrievance } from "../services/routing.service.js";
import { computeSlaDates } from "../services/sla.service.js";
import { notify, notifyRole } from "../services/notification.service.js";
import { CONFIDENCE_THRESHOLD, PRIORITIES, STATUSES } from "../constants.js";

// POST /api/v1/grievances  (citizen)
const submitGrievance = asyncHandler(async (req, res) => {
  const body = req.body ?? {};
  const title = str(body.title);
  const description = str(body.description);
  const district = str(body.district ?? body.location?.district);
  const ward = str(body.ward ?? body.location?.ward);
  const address = str(body.address ?? body.location?.address);

  if (!title || !description || !district) {
    throw new ApiError(400, "title, description and district are required");
  }
  if (title.length > 150) throw new ApiError(400, "Title can be at most 150 characters");
  if (description.length < 10) throw new ApiError(400, "Please describe the problem in at least 10 characters");
  if (description.length > 3000) throw new ApiError(400, "Description can be at most 3000 characters");

  // 1. Save the grievance first (so the ID and the SLA clock start at registration)
  const grievanceId = await generateGrievanceId();
  const grievance = await Grievance.create({
    grievanceId,
    citizen: req.user._id,
    title,
    description,
    location: { district, ward: ward || undefined, address: address || undefined },
    status: "Submitted",
    history: [{ action: "SUBMITTED", by: req.user._id, note: "Grievance registered" }],
  });

  // 2. Classify
  const result = await classifyGrievance(`${title}. ${description}`);
  const department = result.department ? await Department.findOne({ code: result.department }) : null;
  const category =
    department && result.category
      ? await Category.findOne({ name: result.category, department: department._id })
      : null;
  const priority = PRIORITIES.includes(result.priority) ? result.priority : "Medium";
  const confidence = Number(result.confidence) || 0;

  grievance.classification.department = department?._id;
  grievance.classification.category = category?._id;
  grievance.classification.priority = priority;
  grievance.classification.confidence = confidence;
  grievance.classification.source = result.source ?? "keyword";
  addHistory(
    grievance,
    "CLASSIFIED",
    null,
    `${department?.name ?? "Unknown"} / ${category?.name ?? "Unknown"} / ${priority} (confidence ${Math.round(confidence * 100)}%)`
  );

  // 3. SLA clock starts now
  const dates = await computeSlaDates(priority);
  grievance.sla = { ...dates, reminderSent: false };

  // 4. Route, or send to manual review when unsure
  const needsReview = !department || !category || confidence < CONFIDENCE_THRESHOLD;
  if (needsReview) {
    grievance.status = "Under Review";
    addHistory(grievance, "FLAGGED_FOR_REVIEW", null, "Low classification confidence, sent to Central Grievance Cell");
    await grievance.save();
    await notifyRole("cgc", grievance, `${grievanceId} needs classification review`, "ASSIGNED");
  } else {
    await grievance.save();
    await routeGrievance(grievance);
  }

  // 5. Acknowledge the citizen
  await notify(req.user._id, grievance, `Your grievance ${grievanceId} was received`, "ACK");

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        grievanceId,
        status: grievance.status,
        priority,
        confidence,
        needsReview,
        department: department?.name ?? null,
        category: category?.name ?? null,
      },
      "Grievance submitted"
    )
  );
});

// GET /api/v1/grievances/mine  (citizen)
const getMyGrievances = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

  const filter = { citizen: req.user._id };
  if (req.query.status) {
    if (!STATUSES.includes(req.query.status)) throw new ApiError(400, "Invalid status filter");
    filter.status = req.query.status;
  }

  const [items, total] = await Promise.all([
    Grievance.find(filter)
      .select("grievanceId title status classification.priority escalationLevel createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Grievance.countDocuments(filter),
  ]);

  return res.status(200).json(new ApiResponse(200, { items, page, limit, total }));
});

// GET /api/v1/grievances/:grievanceId  (tracking page, access checked by role)
const getGrievanceById = asyncHandler(async (req, res) => {
  const g = await findGrievanceOrThrow(req.params.grievanceId);
  if (!canViewGrievance(g, req.user)) {
    // 404 instead of 403 so people cannot probe which IDs exist
    throw new ApiError(404, "Grievance not found");
  }
  await g.populate(POPULATE_FULL);
  return res.status(200).json(new ApiResponse(200, g));
});

// POST /api/v1/grievances/:grievanceId/close  (citizen, optional)
const closeGrievance = asyncHandler(async (req, res) => {
  const g = await findGrievanceOrThrow(req.params.grievanceId);
  if (!same(g.citizen, req.user._id)) throw new ApiError(404, "Grievance not found");
  if (g.status !== "Resolved") throw new ApiError(400, "Only a resolved grievance can be closed");

  g.status = "Closed";
  addHistory(g, "CLOSED_BY_CITIZEN", req.user, "Citizen confirmed the resolution");
  await g.save();
  return res.status(200).json(new ApiResponse(200, { grievanceId: g.grievanceId, status: g.status }, "Grievance closed"));
});

export { submitGrievance, getMyGrievances, getGrievanceById, closeGrievance };
