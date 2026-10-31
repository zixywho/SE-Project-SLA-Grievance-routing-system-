import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { str } from "../utils/grievanceHelpers.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

// POST /api/v1/auth/register  (public, citizens only)
const registerCitizen = asyncHandler(async (req, res) => {
  const body = req.body ?? {};
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const mobile = str(body.mobile);
  const password = str(body.password);

  if (!name || !email || !password) throw new ApiError(400, "name, email and password are required");
  if (!EMAIL_RE.test(email)) throw new ApiError(400, "Invalid email address");
  if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters");
  if (mobile && !/^\d{10}$/.test(mobile)) throw new ApiError(400, "Mobile number must be 10 digits");

  if (await User.findOne({ email })) throw new ApiError(409, "An account with this email already exists");

  // role is ALWAYS citizen here, never taken from the request
  const user = await User.create({ name, email, mobile: mobile || undefined, password, role: "citizen" });
  const created = await User.findById(user._id); // password is select:false, so it is excluded

  return res.status(201).json(new ApiResponse(201, created, "Registered successfully"));
});

// POST /api/v1/auth/login  (public, all roles)
const loginUser = asyncHandler(async (req, res) => {
  const body = req.body ?? {};
  const email = str(body.email).toLowerCase();
  const password = str(body.password);
  if (!email || !password) throw new ApiError(400, "email and password are required");

  const user = await User.findOne({ email }).select("+password");
  // same message for "no user" and "wrong password" on purpose
  if (!user || !user.isActive || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = user.generateAccessToken();
  const safeUser = await User.findById(user._id).populate("department", "name code");

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, { user: safeUser, accessToken }, "Login successful"));
});

// POST /api/v1/auth/logout
const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken", { httpOnly: true, sameSite: "lax", secure: cookieOptions.secure })
    .json(new ApiResponse(200, {}, "Logged out"));
});

// GET /api/v1/auth/me
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("department", "name code");
  return res.status(200).json(new ApiResponse(200, user));
});

export { registerCitizen, loginUser, logoutUser, getCurrentUser };
