import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/v1/notifications
const getMyNotifications = asyncHandler(async (req, res) => {
  // TODO 1: Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50)
  // TODO 2: also compute unreadCount (for the bell badge)
  // TODO 3: return ApiResponse(200, { notifications, unreadCount })
  throw new ApiError(501, "getMyNotifications not implemented yet");
});

// PATCH /api/v1/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  // TODO 1: findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true })
  //         (the user filter stops people reading each other's notifications)
  // TODO 2: 404 if not found
  // TODO 3: return ApiResponse(200, notification)
  throw new ApiError(501, "markAsRead not implemented yet");
});

// PATCH /api/v1/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  // TODO 1: Notification.updateMany({ user: req.user._id, read: false }, { read: true })
  // TODO 2: return ApiResponse(200, {}, "All marked as read")
  throw new ApiError(501, "markAllAsRead not implemented yet");
});

export { getMyNotifications, markAsRead, markAllAsRead };
