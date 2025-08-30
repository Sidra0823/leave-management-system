
import { Router } from "express";
import { body } from "express-validator";
import { register, login, me } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/register",
  [
    body("name").notEmpty().withMessage("name required"),
    body("email").isEmail().withMessage("valid email required"),
    body("password").isLength({ min: 6 }).withMessage("password min 6 chars"),
  ],
  validate,
  register
);

router.post("/login",
  [
    body("email").isEmail().withMessage("valid email required"),
    body("password").notEmpty().withMessage("password required"),
  ],
  validate,
  login
);

router.get("/me", protect, me);

export default router;
