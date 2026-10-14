import { Department } from "../models/department.model.js";
import { Category } from "../models/category.model.js";
import { SlaRule } from "../models/slaRule.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/v1/masters/departments
const getDepartments = asyncHandler(async (req, res) => {
  // TODO: Department.find({ isActive: true }) -> ApiResponse(200, departments)
  throw new ApiError(501, "getDepartments not implemented yet");
});

// GET /api/v1/masters/categories?department=<id>
const getCategories = asyncHandler(async (req, res) => {
  // TODO 1: build filter from req.query.department (optional)
  // TODO 2: Category.find(filter).populate("department", "name code")
  // TODO 3: return ApiResponse(200, categories)
  throw new ApiError(501, "getCategories not implemented yet");
});

// GET /api/v1/masters/sla-rules
const getSlaRules = asyncHandler(async (req, res) => {
  // TODO: SlaRule.find() -> ApiResponse(200, rules)
  throw new ApiError(501, "getSlaRules not implemented yet");
});

// PATCH /api/v1/masters/sla-rules/:priority  (admin)
const updateSlaRule = asyncHandler(async (req, res) => {
  // TODO 1: read firstResponseMinutes, resolutionMinutes from req.body (positive numbers)
  // TODO 2: validate resolutionMinutes > firstResponseMinutes
  // TODO 3: SlaRule.findOneAndUpdate({ priority: req.params.priority }, {...}, { new: true })
  // TODO 4: 404 if the priority does not exist
  // TODO 5: return ApiResponse(200, rule)
  //         (only affects NEW grievances; existing ones keep their computed deadlines)
  throw new ApiError(501, "updateSlaRule not implemented yet");
});

export { getDepartments, getCategories, getSlaRules, updateSlaRule };
