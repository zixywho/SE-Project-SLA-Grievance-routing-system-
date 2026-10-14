import { Router } from "express";
import {
  getEscalatedL2,
  reassignGrievance,
  reprioritiseGrievance,
} from "../controllers/head.controller.js";
import { verifyJWT, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT, requireRole("head"));

router.get("/escalated", getEscalatedL2); //                               GET   /api/v1/head/escalated
router.post("/grievances/:grievanceId/reassign", reassignGrievance); //    POST  .../reassign
router.patch("/grievances/:grievanceId/priority", reprioritiseGrievance); // PATCH .../priority

export default router;
