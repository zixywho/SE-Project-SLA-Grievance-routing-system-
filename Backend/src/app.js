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

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
});
export { app };