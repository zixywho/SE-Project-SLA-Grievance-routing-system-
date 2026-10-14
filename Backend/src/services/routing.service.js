import { Grievance } from "../models/grievance.model.js";
import { User } from "../models/user.model.js";

// Pick the active officer of a department with the fewest open grievances
const pickOfficer = async (departmentId) => {
  // TODO 1: officers = User.find({ role: "officer", department: departmentId, isActive: true })
  // TODO 2: return null if none
  // TODO 3: for each officer, count Grievance.countDocuments({ assignedOfficer, status in [Assigned, In Progress] })
  // TODO 4: return the officer with the smallest count
  //         (later, optional: also match jurisdiction with the grievance location)
  throw new Error("pickOfficer not implemented yet");
};

// Assign a classified grievance to an officer and update its status
const routeGrievance = async (grievance) => {
  // TODO 1: officer = await pickOfficer(grievance.classification.department)
  // TODO 2: if no officer: status = "Under Review", history "NO_OFFICER_AVAILABLE",
  //         notify CGC, save, return
  // TODO 3: grievance.assignedOfficer = officer._id; status = "Assigned"
  // TODO 4: push history { action: "ASSIGNED", note: officer.name }
  // TODO 5: notify the officer (type "ASSIGNED")
  // TODO 6: await grievance.save() and return grievance
  throw new Error("routeGrievance not implemented yet");
};

export { pickOfficer, routeGrievance };
