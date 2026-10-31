import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/v1/notifications
const getMyNotifications = asyncHandler(async (req, res) => {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ user: req.user._id })
      .populate("grievance", "grievanceId")
      .sort({ createdAt: -1 })
      .limit(50),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);
  return res.status(200).json(new ApiResponse(200, { notifications, unreadCount }));
});

// PATCH /api/v1/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid notification id");
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id }, // user filter: nobody can touch someone else's
    { read: true },
    { new: true }
  );
  if (!n) throw new ApiError(404, "Notification not found");
  return res.status(200).json(new ApiResponse(200, n));
});

// PATCH /api/v1/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  const r = await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  return res.status(200).json(new ApiResponse(200, { updated: r.modifiedCount }, "All marked as read"));
});

export { getMyNotifications, markAsRead, markAllAsRead };
