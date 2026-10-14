import { Router } from "express";
import {
  getDepartments,
  getCategories,
  getSlaRules,
  updateSlaRule,
} from "../controllers/master.controller.js";
import { verifyJWT, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

// Lookup data for dropdowns (CGC correction screen, forms, filters)
router.get("/departments", getDepartments); //   GET   /api/v1/masters/departments
router.get("/categories", getCategories); //     GET   /api/v1/masters/categories?department=<id>
router.get("/sla-rules", getSlaRules); //        GET   /api/v1/masters/sla-rules

// Admin only (the one admin function we keep)
router.patch("/sla-rules/:priority", requireRole("admin"), updateSlaRule); // PATCH /api/v1/masters/sla-rules/High

export default router;
