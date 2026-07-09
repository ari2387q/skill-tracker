import { Router } from "express";
import * as authcontroller from "./auth.controller";
import { protect } from "../../middlewares/auth.middleware";
const router = Router();
router.post("/register", authcontroller.register);
router.post("/login", authcontroller.login);
router.get("/profile", protect, authcontroller.getProfile);
router.get("/verify-email", authcontroller.verifyEmail);
export default router;