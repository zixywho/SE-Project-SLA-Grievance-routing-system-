import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

// POST /api/v1/auth/register  (public, citizens only)
const registerCitizen = asyncHandler(async (req, res) => {
  // TODO 1: read name, email, mobile, password from req.body
  // TODO 2: validate: all required fields present, email format, password min length (6+)
  // TODO 3: check if a user with this email already exists -> ApiError(409)
  // TODO 4: User.create({ name, email, mobile, password, role: "citizen" })
  //         IMPORTANT: force role = "citizen". NEVER take role from req.body.
  // TODO 5: fetch the created user without the password field
  // TODO 6: return ApiResponse(201, user, "Registered successfully")
  throw new ApiError(501, "registerCitizen not implemented yet");
});

// POST /api/v1/auth/login  (public, all roles)
const loginUser = asyncHandler(async (req, res) => {
  // TODO 1: read email and password from req.body, 400 if missing
  // TODO 2: User.findOne({ email }).select("+password")  (password has select:false)
  // TODO 3: if no user or !isActive -> ApiError(401, "Invalid credentials")
  // TODO 4: user.isPasswordCorrect(password) -> if false, ApiError(401, "Invalid credentials")
  //         (same message for both cases, do not reveal which one failed)
  // TODO 5: const token = user.generateAccessToken()
  // TODO 6: res.cookie("accessToken", token, cookieOptions)
  // TODO 7: return user data WITHOUT password + token (so Postman / frontend can use either)
  throw new ApiError(501, "loginUser not implemented yet");
});

// POST /api/v1/auth/logout  (needs login)
const logoutUser = asyncHandler(async (req, res) => {
  // TODO 1: res.clearCookie("accessToken", cookieOptions)
  // TODO 2: return ApiResponse(200, {}, "Logged out")
  throw new ApiError(501, "logoutUser not implemented yet");
});

// GET /api/v1/auth/me  (needs login)
const getCurrentUser = asyncHandler(async (req, res) => {
  // TODO 1: req.user is already set by verifyJWT
  // TODO 2: populate department if the user has one
  // TODO 3: return ApiResponse(200, req.user)
  throw new ApiError(501, "getCurrentUser not implemented yet");
});

export { registerCitizen, loginUser, logoutUser, getCurrentUser };
