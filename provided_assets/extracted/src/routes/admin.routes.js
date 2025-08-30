
import { Router } from "express";
import { body, param } from "express-validator";
import { listAllLeaves, updateLeaveStatus } from "../controllers/leave.controller.js";
import { validate } from "../middleware/validate.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect, authorize("admin"));

router.get("/leaves", listAllLeaves);

router.patch("/leaves/:id/status",
  [
    param("id").isMongoId().withMessage("invalid id"),
    body("status").isIn(["approved", "rejected"]).withMessage("invalid status"),
    body("adminComment").optional().isString().isLength({ max: 300 })
  ],
  validate,
  updateLeaveStatus
);

export default router;
