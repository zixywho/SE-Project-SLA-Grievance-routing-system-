import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) throw new ApiError(401, "Login required");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded._id);
  if (!user || !user.isActive) throw new ApiError(401, "User not found or inactive");
  req.user = user;
  next();
});

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) throw new ApiError(403, "Not allowed");
  next();
};