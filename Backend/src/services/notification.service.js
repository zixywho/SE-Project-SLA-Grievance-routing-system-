import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";

// Create one in-app notification
const notify = async (userId, grievance, message, type = "STATUS") => {
  // TODO: Notification.create({ user: userId, grievance: grievance?._id, message, type })
  //       (later, optional: also console.log or send an email to simulate the gateway)
  throw new Error("notify not implemented yet");
};

// Notify every active user with a role (e.g. all CGC users, or all heads of one department)
const notifyRole = async (role, grievance, message, type = "STATUS", departmentId = null) => {
  // TODO 1: users = User.find({ role, isActive: true, ...(departmentId && { department: departmentId }) })
  // TODO 2: loop and call notify() for each user
  throw new Error("notifyRole not implemented yet");
};

export { notify, notifyRole };
