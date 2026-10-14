import { Router } from "express";
import {
  getAssignedGrievances,
  updateGrievanceStatus,
  resolveGrievance,
  rejectGrievance,
} from "../controllers/officer.controller.js";
import { verifyJWT, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT, requireRole("officer"));

router.get("/grievances", getAssignedGrievances); //                       GET   /api/v1/officer/grievances
router.patch("/grievances/:grievanceId/status", updateGrievanceStatus); // PATCH /api/v1/officer/grievances/GRV-0001/status
router.post("/grievances/:grievanceId/resolve", resolveGrievance); //      POST  .../resolve
router.post("/grievances/:grievanceId/reject", rejectGrievance); //        POST  .../reject

export default router;
