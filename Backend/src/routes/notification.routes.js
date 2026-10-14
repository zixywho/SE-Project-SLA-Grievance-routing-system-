import { Router } from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.get("/", getMyNotifications); //          GET   /api/v1/notifications
router.patch("/read-all", markAllAsRead); //     PATCH /api/v1/notifications/read-all  (keep before "/:id/read")
router.patch("/:id/read", markAsRead); //        PATCH /api/v1/notifications/<id>/read

export default router;
