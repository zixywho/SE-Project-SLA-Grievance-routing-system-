import { Grievance } from "../models/grievance.model.js";
import { Department } from "../models/department.model.js";
import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateGrievanceId } from "../utils/generateGrievanceId.js";
import { classifyGrievance } from "../services/classifier.service.js";
import { routeGrievance } from "../services/routing.service.js";
import { computeSlaDates } from "../services/sla.service.js";
import { notify } from "../services/notification.service.js";
import { CONFIDENCE_THRESHOLD } from "../constants.js";

// POST /api/v1/grievances  (citizen)  <-- the most important endpoint
const submitGrievance = asyncHandler(async (req, res) => {
  // TODO 1: read title, description, district, ward, address from req.body
  // TODO 2: validate: title, description, district required -> ApiError(400)
  // TODO 3: grievanceId = await generateGrievanceId()
  // TODO 4: create the grievance: status "Submitted", citizen = req.user._id,
  //         history: [{ action: "SUBMITTED", by: req.user._id }]
  // TODO 5: result = await classifyGrievance(title + " " + description)
  //         -> { department (code), category (name), priority, confidence, source }
  // TODO 6: look up Department by code and Category by name (+ department) to get ObjectIds
  //         save into grievance.classification; push history "CLASSIFIED"
  // TODO 7: compute SLA dates: computeSlaDates(priority) -> save into grievance.sla
  //         (SLA clock starts at registration, so do this even for Under Review cases)
  // TODO 8: if confidence < CONFIDENCE_THRESHOLD or department missing:
  //            status = "Under Review", push history, notify all CGC users, save, respond
  //         else:
  //            await routeGrievance(grievance)  (assigns officer, status = "Assigned")
  // TODO 9: notify the citizen (type "ACK") with the grievanceId
  // TODO 10: return ApiResponse(201, { grievanceId, status }, "Grievance submitted")
  // TODO (last): evidence upload -> multer + cloudinary -> push to grievance.attachments
  throw new ApiError(501, "submitGrievance not implemented yet");
});

// GET /api/v1/grievances/mine  (citizen)
const getMyGrievances = asyncHandler(async (req, res) => {
  // TODO 1: Grievance.find({ citizen: req.user._id }).sort({ createdAt: -1 })
  // TODO 2: select only list fields (grievanceId, title, status, priority, createdAt)
  // TODO 3: optional ?status= filter, optional pagination (?page, ?limit)
  // TODO 4: return ApiResponse(200, grievances)
  throw new ApiError(501, "getMyGrievances not implemented yet");
});

// GET /api/v1/grievances/:grievanceId  (any logged-in user, tracking page)
const getGrievanceById = asyncHandler(async (req, res) => {
  // TODO 1: find by grievanceId (the "GRV-0001" string, not _id)
  //         populate citizen (name only), assignedOfficer (name only),
  //         classification.department, classification.category
  // TODO 2: 404 if not found
  // TODO 3: access check:
  //         citizen  -> only if grievance.citizen equals req.user._id
  //         officer  -> only if assignedOfficer equals req.user._id
  //         head     -> only if classification.department equals req.user.department
  //         cgc/admin-> always allowed
  //         otherwise ApiError(403)
  // TODO 4: return ApiResponse(200, grievance)  (includes the full history array)
  throw new ApiError(501, "getGrievanceById not implemented yet");
});

// POST /api/v1/grievances/:grievanceId/close  (citizen)  OPTIONAL, do last
const closeGrievance = asyncHandler(async (req, res) => {
  // TODO 1: find grievance, must belong to req.user and be status "Resolved"
  // TODO 2: status = "Closed", push history "CLOSED_BY_CITIZEN", save
  // TODO 3: return ApiResponse(200, grievance, "Grievance closed")
  throw new ApiError(501, "closeGrievance not implemented yet");
});

export { submitGrievance, getMyGrievances, getGrievanceById, closeGrievance };
