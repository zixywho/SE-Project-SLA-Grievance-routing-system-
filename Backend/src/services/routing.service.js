import mongoose from "mongoose";
import { Grievance } from "../models/grievance.model.js";
import { User } from "../models/user.model.js";
import { Department } from "../models/department.model.js";
import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { addHistory, same, CLOSED_STATUSES, OPEN_WORK_STATUSES } from "../utils/grievanceHelpers.js";
import { notify, notifyRole } from "./notification.service.js";

// Active officer of a department with the fewest open grievances.
const pickOfficer = async (departmentId, excludeOfficerId = null) => {
  const filter = { role: "officer", department: departmentId, isActive: true };
  if (excludeOfficerId) filter._id = { $ne: excludeOfficerId };

  const officers = await User.find(filter);
  if (!officers.length) return null;

  const loads = await Promise.all(
    officers.map((o) =>
      Grievance.countDocuments({ assignedOfficer: o._id, status: { $in: OPEN_WORK_STATUSES } })
    )
  );
  let best = 0;
  for (let i = 1; i < officers.length; i++) if (loads[i] < loads[best]) best = i;
  return officers[best];
};

// Assign a classified grievance to an officer. Saves the grievance.
const routeGrievance = async (grievance) => {
  const deptId = grievance.classification?.department;
  const officer = deptId ? await pickOfficer(deptId) : null;

  if (!officer) {
    grievance.status = "Under Review";
    grievance.assignedOfficer = null;
    addHistory(grievance, "NO_OFFICER_AVAILABLE", null, "No officer found for this department, sent to Central Grievance Cell");
    await grievance.save();
    await notifyRole("cgc", grievance, `${grievance.grievanceId} needs manual routing (no officer available)`, "ASSIGNED");
    return grievance;
  }

  grievance.assignedOfficer = officer._id;
  grievance.status = "Assigned";
  addHistory(grievance, "ASSIGNED", null, `Assigned to ${officer.name}`);
  await grievance.save();

  await notify(officer._id, grievance, `New grievance ${grievance.grievanceId} assigned to you`, "ASSIGNED");
  await notify(grievance.citizen, grievance, `Your grievance ${grievance.grievanceId} has been assigned to an officer`, "STATUS");
  return grievance;
};

// Move a grievance to another officer and/or department.
// Used by CGC (may change department) and Head (same department only).
const reassign = async (grievance, { departmentId, categoryId, officerId, reason, by }) => {
  if (CLOSED_STATUSES.includes(grievance.status)) {
    throw new ApiError(400, "A resolved or closed grievance cannot be reassigned");
  }

  const oldOfficerId = grievance.assignedOfficer;
  let targetDeptId = grievance.classification.department;
  let deptChanged = false;

  if (departmentId) {
    if (!mongoose.isValidObjectId(departmentId)) throw new ApiError(400, "Invalid departmentId");
    const dept = await Department.findById(departmentId);
    if (!dept) throw new ApiError(404, "Department not found");
    deptChanged = !same(dept._id, targetDeptId);
    targetDeptId = dept._id;
  }
  if (!targetDeptId) throw new ApiError(400, "departmentId is required for this grievance");

  if (deptChanged) {
    grievance.classification.department = targetDeptId;
    grievance.classification.category = undefined; // old category belongs to the old department
  }
  if (categoryId) {
    if (!mongoose.isValidObjectId(categoryId)) throw new ApiError(400, "Invalid categoryId");
    const cat = await Category.findById(categoryId);
    if (!cat) throw new ApiError(404, "Category not found");
    if (!same(cat.department, targetDeptId)) throw new ApiError(400, "Category does not belong to that department");
    grievance.classification.category = cat._id;
  }

  let officer;
  if (officerId) {
    if (!mongoose.isValidObjectId(officerId)) throw new ApiError(400, "Invalid officerId");
    officer = await User.findOne({ _id: officerId, role: "officer", isActive: true });
    if (!officer) throw new ApiError(404, "Officer not found");
    if (!same(officer.department, targetDeptId)) throw new ApiError(400, "That officer does not belong to the target department");
  } else {
    officer = (await pickOfficer(targetDeptId, oldOfficerId)) || (await pickOfficer(targetDeptId));
    if (!officer) throw new ApiError(400, "No active officer available in that department");
  }

  grievance.assignedOfficer = officer._id;
  grievance.status = "Assigned";
  addHistory(grievance, "REASSIGNED", by, `${reason ? reason + " | " : ""}Now assigned to ${officer.name}`);
  await grievance.save();

  await notify(officer._id, grievance, `Grievance ${grievance.grievanceId} was reassigned to you`, "ASSIGNED");
  if (oldOfficerId && !same(oldOfficerId, officer._id)) {
    await notify(oldOfficerId, grievance, `Grievance ${grievance.grievanceId} was taken off your queue`, "STATUS");
  }
  await notify(grievance.citizen, grievance, `Your grievance ${grievance.grievanceId} has been reassigned`, "STATUS");
  return grievance;
};

export { pickOfficer, routeGrievance, reassign };