import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";

// Create one in-app notification. Never throws: a failed notification
// must not break the main action (submit, resolve, escalate...).
const notify = async (userId, grievance, message, type = "STATUS") => {
  if (!userId) return null;
  try {
    return await Notification.create({
      user: userId,
      grievance: grievance?._id,
      message,
      type,
    });
  } catch (err) {
    console.error("notify failed:", err.message);
    return null;
  }
};

// Notify every active user of a role (optionally only one department).
// Returns how many users were notified.
const notifyRole = async (role, grievance, message, type = "STATUS", departmentId = null) => {
  const filter = { role, isActive: true };
  if (departmentId) filter.department = departmentId;
  const users = await User.find(filter).select("_id");
  await Promise.all(users.map((u) => notify(u._id, grievance, message, type)));
  return users.length;
};

export { notify, notifyRole };