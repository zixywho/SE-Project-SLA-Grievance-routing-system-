import mongoose from "mongoose";
import { Department } from "../models/department.model.js";
import { Category } from "../models/category.model.js";
import { SlaRule } from "../models/slaRule.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PRIORITIES } from "../constants.js";

// GET /api/v1/masters/departments
const getDepartments = asyncHandler(async (req, res) => {
  const items = await Department.find({ isActive: true }).sort({ name: 1 });
  return res.status(200).json(new ApiResponse(200, items));
});

// GET /api/v1/masters/categories?department=<id>
const getCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.department) {
    if (!mongoose.isValidObjectId(req.query.department)) throw new ApiError(400, "Invalid department id");
    filter.department = req.query.department;
  }
  const items = await Category.find(filter).populate("department", "name code").sort({ name: 1 });
  return res.status(200).json(new ApiResponse(200, items));
});

// GET /api/v1/masters/sla-rules
const getSlaRules = asyncHandler(async (req, res) => {
  const rules = await SlaRule.find();
  rules.sort((a, b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority));
  return res.status(200).json(new ApiResponse(200, rules));
});

// PATCH /api/v1/masters/sla-rules/:priority   (admin)  body: { firstResponseMinutes, resolutionMinutes }
// Only affects NEW grievances; existing ones keep the deadlines already computed.
const updateSlaRule = asyncHandler(async (req, res) => {
  const { priority } = req.params;
  if (!PRIORITIES.includes(priority)) throw new ApiError(400, `priority must be one of: ${PRIORITIES.join(", ")}`);

  const first = Number(req.body?.firstResponseMinutes);
  const resolution = Number(req.body?.resolutionMinutes);
  if (!(first > 0) || !(resolution > 0)) {
    throw new ApiError(400, "firstResponseMinutes and resolutionMinutes must be positive numbers");
  }
  if (resolution <= first) throw new ApiError(400, "resolutionMinutes must be greater than firstResponseMinutes");

  const rule = await SlaRule.findOneAndUpdate(
    { priority },
    { firstResponseMinutes: first, resolutionMinutes: resolution },
    { new: true }
  );
  if (!rule) throw new ApiError(404, "SLA rule not found for that priority");
  return res.status(200).json(new ApiResponse(200, rule, "SLA rule updated"));
});

export { getDepartments, getCategories, getSlaRules, updateSlaRule };
