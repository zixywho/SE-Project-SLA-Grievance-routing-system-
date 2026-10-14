import { Router } from "express";
import {
  submitGrievance,
  getMyGrievances,
  getGrievanceById,
  closeGrievance,
} from "../controllers/grievance.controller.js";
import { verifyJWT, requireRole } from "../middlewares/auth.middleware.js";
// TODO (last, optional): import { upload } from "../middlewares/multer.middleware.js";
//   then use: upload.array("evidence", 3) on the submit route

const router = Router();
router.use(verifyJWT);

// Citizen only
router.post("/", requireRole("citizen"), submitGrievance); //        POST /api/v1/grievances
router.get("/mine", requireRole("citizen"), getMyGrievances); //     GET  /api/v1/grievances/mine
router.post("/:grievanceId/close", requireRole("citizen"), closeGrievance); // OPTIONAL

// Any logged-in user (controller checks if this user is allowed to see it)
// NOTE: keep this AFTER "/mine", otherwise "mine" is treated as an id
router.get("/:grievanceId", getGrievanceById); //                    GET  /api/v1/grievances/GRV-0001

export default router;
