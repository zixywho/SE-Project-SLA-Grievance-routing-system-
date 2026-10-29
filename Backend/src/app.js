import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ status: "ok" }));

// routes (add as you build them)
// import authRouter from "./routes/auth.routes.js";
// app.use("/api/v1/auth", authRouter);
import authRouter from "./routes/auth.routes.js";
import grievanceRouter from "./routes/grievance.routes.js";
import officerRouter from "./routes/officer.routes.js";
import cgcRouter from "./routes/cgc.routes.js";
import headRouter from "./routes/head.routes.js";
import reportRouter from "./routes/report.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import masterRouter from "./routes/master.routes.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/grievances", grievanceRouter);
app.use("/api/v1/officer", officerRouter);
app.use("/api/v1/cgc", cgcRouter);
app.use("/api/v1/head", headRouter);
app.use("/api/v1/reports", reportRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/masters", masterRouter);

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler (turns ApiError and Mongoose errors into clean JSON)
app.use((err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") status = 400;
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid value for ${err.path}`;
  }
  if (err.code === 11000) {
    status = 409;
    message = "Duplicate value: " + Object.keys(err.keyValue || {}).join(", ");
  }
  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON in request body";
  }
  if (status === 500) console.error(err);

  res.status(status).json({
    success: false,
    message,
    errors: Array.isArray(err.errors) ? err.errors : [],
  });
});

export { app };