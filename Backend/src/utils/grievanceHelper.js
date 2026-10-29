import { Grievance } from "../models/grievance.model.js";
import { ApiError } from "./ApiError.js";

export const PRIORITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };
export const CLOSED_STATUSES = ["Resolved", "Closed"];
export const OPEN_WORK_STATUSES = ["Assigned", "In Progress"];

// Safe id comparison: false if either side is missing
// (String(undefined) === String(undefined) would wrongly be true)
export const same = (a, b) => Boolean(a) && Boolean(b) && String(a) === String(b);

// Trim any input safely (numbers, undefined, null all become strings)
export const str = (v) => String(v ?? "").trim();

export const findGrievanceOrThrow = async (grievanceId) => {
  const g = await Grievance.findOne({
    grievanceId: String(grievanceId).toUpperCase(),
  });
  if (!g) throw new ApiError(404, "Grievance not found");
  return g;
};

export const addHistory = (grievance, action, by, note) => {
  grievance.history.push({ action, by: by?._id ?? by ?? undefined, note });
};

export const canViewGrievance = (g, user) => {
  switch (user.role) {
    case "citizen":
      return same(g.citizen, user._id);
    case "officer":
      return same(g.assignedOfficer, user._id);
    case "head":
      return same(g.classification?.department, user.department);
    case "cgc":
    case "admin":
      return true;
    default:
      return false;
  }
};

export const assertHeadOwns = (g, user) => {
  if (!same(g.classification?.department, user.department)) {
    throw new ApiError(403, "This grievance belongs to another department");
  }
};

export const POPULATE_FULL = [
  { path: "citizen", select: "name email mobile" },
  { path: "assignedOfficer", select: "name email" },
  { path: "classification.department", select: "name code" },
  { path: "classification.category", select: "name" },
  { path: "history.by", select: "name role" },
];