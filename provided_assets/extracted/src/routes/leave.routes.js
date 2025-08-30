
import { Router } from "express";
import { body, param } from "express-validator";
import { createLeave, myLeaves, cancelLeave } from "../controllers/leave.controller.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.post("/",
  [
    body("type").isIn(["sick", "casual", "earned"]).withMessage("invalid leave type"),
    body("startDate").isISO8601().toDate().withMessage("startDate required"),
    body("endDate").isISO8601().toDate().withMessage("endDate required"),
    body("reason").optional().isString().isLength({ max: 300 }).withMessage("reason too long"),
  ],
  validate,
  createLeave
);

router.get("/", myLeaves);

router.patch("/:id/cancel",
  [ param("id").isMongoId().withMessage("invalid id") ],
  validate,
  cancelLeave
);

export default router;
