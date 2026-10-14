import { Router } from "express";
import {
  getSummary,
  getByDepartmentAndStatus,
  getSlaCompliance,
  getResolutionTime,
  getEscalationCounts,
} from "../controllers/report.controller.js";
import { verifyJWT, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT, requireRole("head", "cgc", "admin"));

router.get("/summary", getSummary); //                       GET /api/v1/reports/summary
router.get("/by-department", getByDepartmentAndStatus); //   GET /api/v1/reports/by-department
router.get("/sla-compliance", getSlaCompliance); //          GET /api/v1/reports/sla-compliance
router.get("/resolution-time", getResolutionTime); //        GET /api/v1/reports/resolution-time
router.get("/escalations", getEscalationCounts); //          GET /api/v1/reports/escalations

export default router;
