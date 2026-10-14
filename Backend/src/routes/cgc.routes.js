import { Router } from "express";
import {
  getReviewQueue,
  reviewGrievance,
  getEscalatedL3,
  reassignGrievance,
} from "../controllers/cgc.controller.js";
import { verifyJWT, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT, requireRole("cgc"));

router.get("/review", getReviewQueue); //                                GET  /api/v1/cgc/review  (Under Review queue)
router.post("/review/:grievanceId", reviewGrievance); //                 POST /api/v1/cgc/review/GRV-0001 (confirm / correct)
router.get("/escalated", getEscalatedL3); //                             GET  /api/v1/cgc/escalated (L3 cases)
router.post("/grievances/:grievanceId/reassign", reassignGrievance); //  POST .../reassign

export default router;
